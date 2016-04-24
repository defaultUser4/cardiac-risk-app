(function (window, undefined) {

    'use strict';

    var CardiacRisk = {};
    var PatientInfo = {};

    CardiacRisk.colorClasses = {
        lowRisk: 'backgroundColorLowRisk',
        lowModerateRisk: 'backgroundColorLowModerateRisk',
        moderateRisk: 'backgroundColorModerateRisk',
        highRisk: 'backgroundColorHighRisk',
        rangeSliderThumbWhiteText: 'rangeSliderThumbStyleWhite',
        grayBarColor: 'colorGray'
    };

    /**
     * Loads patient's FHIR data and updates the CardiacRisk data model.
     * Fetches patient context to get basic patient info and observations to get lab results based on the
     * supplied LOINC codes.
     * LOINC Codes used : 'http://loinc.org|30522-7', 'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
     * 'http://loinc.org|2085-9', 'http://loinc.org|8480-6', 'http://loinc.org|2089-1', 'http://loinc.org|13457-7'
     * @method fetchDataAndPopulateCardiacRiskObject
     */
    var fetchDataAndPopulateCardiacRiskObject = function () {

        //Setting this flag to indicate the system, to display the first error screen triggered.
        //This flag gets set to false once the error screen has been displayed to stop further UI updates.
        CardiacRisk.shouldProcessError = true;

        var deferred = $.Deferred();
        FHIR.oauth2.ready(onReady,onError);
        function onReady(smart) {
            CardiacRisk.hideDemographicsBanner = (smart.tokenResponse.need_patient_banner === false);

            // Calculating date 1 year in the past from the day the application is ran. Its used to fetch labs as
            // far as 1 year in past.
            var currentDate = new Date();
            var dateInPast = new Date();
            dateInPast.setFullYear( currentDate.getFullYear() - 1 );

            if (smart.hasOwnProperty('patient')) {
                var patientQuery = smart.patient.read();
                var labsQuery = smart.patient.api.fetchAll({
                    type: "Observation",
                    query: {
                        code: {
                            $or: ['http://loinc.org|2089-1', 'http://loinc.org|13457-7',
                                'http://loinc.org|30522-7', 'http://loinc.org|14647-2',
                                'http://loinc.org|2093-3', 'http://loinc.org|2085-9', 'http://loinc.org|8480-6'
                            ]
                        }
                    }
                });
                $.when(patientQuery, labsQuery)
                    .done(function (patientData, labResults) {

                        PatientInfo.firstName = patientData.name[0].given.join(' ');
                        PatientInfo.lastName = patientData.name[0].family.join(' ');
                        PatientInfo.gender = patientData.gender;
                        PatientInfo.dateOfBirth = new Date(patientData.birthDate);
                        PatientInfo.age = CardiacRisk.computeAgeFromBirthDate(PatientInfo.dateOfBirth);

                        CardiacRisk.patientInfo = PatientInfo;

                        var relatedFactors = {};
                        /* Default to undefined since we want to remove error state on radio buttons on the first go */
                        relatedFactors.smoker = undefined;
                        relatedFactors.familyHeartAttackHistory = undefined;
                        relatedFactors.race = 'white';
                        relatedFactors.hypertension = true;
                        relatedFactors.diabetic = true;
                        CardiacRisk.patientInfo.relatedFactors = relatedFactors;

                        var labsByLoincCodes = smart.byCodes(labResults, 'code');
                        CardiacRisk.processLabsData(labsByLoincCodes);
                        if (CardiacRisk.hasObservationWithUnsupportedUnits &&
                            CardiacRisk.isRequiredLabsNotAvailable()) {
                            processError('One or more results has an unsupported unit of measure. ' +
                            'Cardiac Risk cannot  be calculated.');
                        }
                        deferred.resolve();

                    })
                    .fail(function () {
                        processError('There was an error loading the application.');
                    });
            }
            else {
                processError('There was an error loading the application.');
            }
        }
        function onError() {
            processError('There was an error loading the application.');
            deferred.reject();
        }
        return deferred.promise();
    };
    CardiacRisk.fetchDataAndPopulateCardiacRiskObject = fetchDataAndPopulateCardiacRiskObject;

    /**
     * Processes labs fetched. Fetches subsequent available pages until we have values for all the labs.
     * @param labsByLoincCodes : function to fetch array of observations given loinc codes.
     */
    var processLabsData = function (labsByLoincCodes) {
        CardiacRisk.hasObservationWithUnsupportedUnits = false;

        CardiacRisk.patientInfo.hsCReactiveProtein = CardiacRisk.getHSCRPValue(labsByLoincCodes("30522-7"));
        CardiacRisk.patientInfo.totalCholesterol = CardiacRisk.getCholesterolValue(labsByLoincCodes('14647-2', '2093-3'));
        CardiacRisk.patientInfo.hdl = CardiacRisk.getCholesterolValue(labsByLoincCodes('2085-9'));
        CardiacRisk.patientInfo.ldl = CardiacRisk.getCholesterolValue(labsByLoincCodes('2089-1'));
        CardiacRisk.patientInfo.ldlCalculated = CardiacRisk.getCholesterolValue(labsByLoincCodes('13457-7'));
        CardiacRisk.patientInfo.systolicBloodPressure = CardiacRisk.getSystolicBloodPressureValue(labsByLoincCodes('8480-6'));

        //We need to look for ldlDirect before we consider ldlCalculated value for ldl.
        if (CardiacRisk.patientInfo.ldl === undefined) {
            CardiacRisk.patientInfo.ldl = CardiacRisk.patientInfo.ldlCalculated;
        }
    };
    CardiacRisk.processLabsData = processLabsData;

    /**
     * Sorting function to sort observations based on the time stamp returned. Sorting is done to get most recent date first.
     * @param labsToSort : Array of observations to sort
     * @returns labsToSort : Returns the sorted array.
     */
    var sortObservationsByAppliesTimeStamp = function (labsToSort) {
        labsToSort.sort(function (a,b) {
            return Date.parse(b.appliesDateTime) - Date.parse(a.appliesDateTime);
        });
        return labsToSort;
    };
    CardiacRisk.sortObservationsByAppliesTimeStamp = sortObservationsByAppliesTimeStamp;

    /**
     * Fetches current cholesterol into units of mg/dL
     * @method getCholesterolValue
     * @param {object} cholesterolObservations - Cholesterol array object with valueQuantity elements having units and value.
     */
    var getCholesterolValue = function (cholesterolObservations) {
        return CardiacRisk.getFirstValidDataPointValueFromObservations(cholesterolObservations, function (dataPoint) {
            if (dataPoint.valueQuantity.unit === 'mg/dL') {
                return parseFloat(dataPoint.valueQuantity.value);
            }
            else if (dataPoint.valueQuantity.unit === 'mmol/L') {
                return parseFloat(dataPoint.valueQuantity.value) / 0.026;
            }
            else {
                return undefined;
            }
        });
    };
    CardiacRisk.getCholesterolValue = getCholesterolValue;

    /**
     * Fetches current high sensitivity C-reactive protein into value in mg/L
     * @method getHSCRPValue
     * @param {object} hsCRPObservations - hscrp array object with valueQuantity elements having units and value.
     */
    var getHSCRPValue = function (hsCRPObservations) {
        return CardiacRisk.getFirstValidDataPointValueFromObservations(hsCRPObservations, function (dataPoint) {
            if (dataPoint.valueQuantity.unit === 'mg/L') {
                return parseFloat(dataPoint.valueQuantity.value);
            }
            else if (dataPoint.valueQuantity.unit === 'mmol/L') {
                return parseFloat(dataPoint.valueQuantity.value) / 0.10;
            }
            else {
                return undefined;
            }
        });
    };
    CardiacRisk.getHSCRPValue = getHSCRPValue;

    /**
     * Fetches current Systolic Blood Pressure
     * @method getSystolicBloodPressureValue
     * @param {object} sysBPObservations - sysBloodPressure array object with valueQuantity elements having units and value.
     */
    var getSystolicBloodPressureValue = function (sysBPObservations) {
        return CardiacRisk.getFirstValidDataPointValueFromObservations(sysBPObservations, function (dataPoint) {
            if (dataPoint.valueQuantity.unit === 'mmHg' || dataPoint.valueQuantity.unit === 'mm[Hg]') {
                return parseFloat(dataPoint.valueQuantity.value);
            }
            else {
                return undefined;
            }
        });
    };
    CardiacRisk.getSystolicBloodPressureValue = getSystolicBloodPressureValue;

    /**
     * Fetches the most recent valid dataPointValue from the observations .
     * Validity criteria :
     * 1. status : 'final' or 'amended'
     * 2. availability of the valueQuantity field having value and units
     * 3. units are supported.
     * The method also sets a flag on the Cardiac Risk model about an observation with an unsupported unit.
     * @param observations : Array of observations to be used to find the valid dataPoint
     * @param supportedUnitsCriteria : Criteria function supplied to be used for every dataPoint.
     * @returns dataPointValue : Single observation value which meets the criteria. If no dataPointValue is valid then
     * undefined is returned to fetch further more results.
     */
    var getFirstValidDataPointValueFromObservations = function (observations, supportedUnitsCriteria) {
        var dataPoints = CardiacRisk.sortObservationsByAppliesTimeStamp(observations);
        for (var i = 0; i < dataPoints.length; i++) {

            if ((dataPoints[i].status.toLowerCase() === 'final' || dataPoints[i].status.toLowerCase() === 'amended') &&
                dataPoints[i].hasOwnProperty('valueQuantity') && dataPoints[i].valueQuantity.value &&
                dataPoints[i].valueQuantity.unit) {

                var dataPointValue = supportedUnitsCriteria(dataPoints[i]);
                if (dataPointValue !== undefined) {
                    return dataPointValue;
                }

                // We set this flag here to process later ( once all pages have been scanned for a valid dataPoint),
                // to convey to the user about unsupported units.
                CardiacRisk.hasObservationWithUnsupportedUnits = true;
            }
        }
        return undefined;
    };
    CardiacRisk.getFirstValidDataPointValueFromObservations = getFirstValidDataPointValueFromObservations;

    /**
     * Method to calculate age from the provided date of birth considering leapYear.
     * @param birthDate - Date of birth in Date Object format.
     * @returns {number} - Age of the person.
     */
    var computeAgeFromBirthDate = function (birthDate) {

        function isLeapYear(year) {
            return new Date(year, 1, 29).getMonth() == 1;
        }

        var now = new Date();
        var years = now.getFullYear() - birthDate.getFullYear();
        birthDate.setFullYear(birthDate.getFullYear() + years);
        if (birthDate > now) {
            years--;
            birthDate.setFullYear(birthDate.getFullYear() - 1);
        }
        var days = (now.getTime() - birthDate.getTime()) / (3600 * 24 * 1000);
        return Math.floor(years + days / (isLeapYear(now.getFullYear()) ? 366 : 365));

    };
    CardiacRisk.computeAgeFromBirthDate = computeAgeFromBirthDate;

    /**
     * Computes the widely-used Reynolds Risk Score, a score that estimates the 10-year cardiovascular risk of an individual.
     * See {@link http://www.reynoldsriskscore.org/}
     * @method computeRRS
     * @param {object} patientInfo - patientInfo object from CardiacRisk data model.
     */
    var computeRRS = function (patientInfo) {
        var params = {};
        if (patientInfo.gender.toLowerCase() === 'female') {
            params = {
                'age': 0.0799,
                'sbp': 3.137,
                'hsCRP': 0.180,
                'cholesterol': 1.382,
                'HDL': -1.172,
                'smoker': 0.818,
                'fx_of_mi': 0.438
            };
        } else if (patientInfo.gender.toLowerCase() === 'male') {
            params = {
                'age': 4.385,
                'sbp': 2.607,
                'hsCRP': 0.102,
                'cholesterol': 0.963,
                'HDL': -0.772,
                'smoker': 0.405,
                'fx_of_mi': 0.541
            };
        }

        function computeTotalParams(params, patientInfo) {
            var ageParam = params.age * (patientInfo.gender.toLowerCase() === 'female' ? patientInfo.age : Math.log(patientInfo.age));
            var sbpParam = params.sbp * Math.log(patientInfo.systolicBloodPressure);
            var crpParam = params.hsCRP * Math.log(patientInfo.hsCReactiveProtein);
            var cholesterolParam = params.cholesterol * Math.log(patientInfo.totalCholesterol);
            var hdlParam = params.HDL * Math.log(patientInfo.hdl);
            var smokerParam = params.smoker * (patientInfo.relatedFactors.smoker ? 1 : 0);
            var famHistoryParam = params.fx_of_mi * (patientInfo.relatedFactors.familyHeartAttackHistory ? 1 : 0);
            return ageParam + sbpParam + crpParam + cholesterolParam + hdlParam + smokerParam + famHistoryParam;
        }

        function computeResult(params, patientInfo) {
            var scoreConstants = (patientInfo.gender.toLowerCase() === 'female') ? [22.325, 0.98634] : [33.097, 0.8990];
            var totalParams = computeTotalParams(params, patientInfo);
            var result = (1 - Math.pow(scoreConstants[1], (Math.exp(totalParams - scoreConstants[0])))) * 100;
            return result;
        }

        var riskResult = computeResult(params, patientInfo);

        return Math.round(riskResult < 10 ? riskResult.toPrecision(1) : riskResult.toPrecision(2));
    };
    CardiacRisk.computeRRS = computeRRS;

    /**
    * Computes the ASCVD Risk Estimate for an individual over the next 10 years.
    * @param patientInfo - patientInfo object from CardiacRisk data model
    */
    var computeTenYearASCVD = function(patientInfo) {
        var lnAge = Math.log(patientInfo.age);
        var lnTotalChol = Math.log(patientInfo.totalCholesterol);
        var lnHdl = Math.log(patientInfo.hdl);
        var trlnsbp = patientInfo.relatedFactors.hypertension ? Math.log(parseFloat(patientInfo.systolicBloodPressure)) : 0;
        var ntlnsbp = patientInfo.relatedFactors.hypertension ? 0 : Math.log(parseFloat(patientInfo.systolicBloodPressure));
        var ageTotalChol = lnAge * lnTotalChol;
        var ageHdl = lnAge * lnHdl;
        var agetSbp = lnAge * trlnsbp;
        var agentSbp = lnAge * ntlnsbp;
        var ageSmoke = patientInfo.relatedFactors.smoker ? lnAge : 0;

        var isAA = patientInfo.relatedFactors.race === 'aa';
        var isMale = patientInfo.gender === 'male';
        var s010Ret = 0;
        var mnxbRet = 0;
        var predictRet = 0;

        var calculateScore = function() {
            if (isAA && !isMale) {
                s010Ret = 0.95334;
                mnxbRet = 86.6081;
                predictRet = 17.1141 * lnAge + 0.9396 * lnTotalChol + (-18.9196 * lnHdl) + 4.4748 * ageHdl + 29.2907 *
                    trlnsbp + (-6.4321 * agetSbp) + 27.8197 * ntlnsbp + (-6.0873 * agentSbp) + 0.6908 *
                    Number(patientInfo.relatedFactors.smoker) + 0.8738 * Number(patientInfo.relatedFactors.diabetic);
            } else if (!isAA && !isMale) {
                s010Ret = 0.96652;
                mnxbRet = -29.1817;
                predictRet = (-29.799 * lnAge) + 4.884 * Math.pow(lnAge, 2) + 13.54 * lnTotalChol + (-3.114 * ageTotalChol) +
                    (-13.578 * lnHdl) + 3.149 * ageHdl + 2.019 * trlnsbp + 1.957 * ntlnsbp + 7.574 *
                    Number(patientInfo.relatedFactors.smoker) + (-1.665 * ageSmoke) + 0.661 *
                    Number(patientInfo.relatedFactors.diabetic);
            } else if (isAA && isMale) {
                s010Ret = 0.89536;
                mnxbRet = 19.5425;
                predictRet = 2.469 * lnAge + 0.302 * lnTotalChol + (-0.307 * lnHdl) + 1.916 * trlnsbp + 1.809 * ntlnsbp +
                    0.549 * Number(patientInfo.relatedFactors.smoker) + 0.645 * Number(patientInfo.relatedFactors.diabetic);
            } else {
                s010Ret = 0.91436;
                mnxbRet = 61.1816;
                predictRet = 12.344 * lnAge + 11.853 * lnTotalChol + (-2.664 * ageTotalChol) + (-7.99 * lnHdl) + 1.769 *
                    ageHdl + 1.797 * trlnsbp + 1.764 * ntlnsbp + 7.837 * Number(patientInfo.relatedFactors.smoker) +
                    (-1.795 * ageSmoke) + 0.658 * Number(patientInfo.relatedFactors.diabetic);
            }

            return (1 - Math.pow(s010Ret, Math.exp(predictRet - mnxbRet)));
        };
        return calculateScore();
    };
    CardiacRisk.computeTenYearASCVD = computeTenYearASCVD;

    /**
    * Computes the ASCVD Risk Estimate for an individual under optimal conditions
    * @returns {*} Returns the ASCVD risk estimate
    */
    var computeOptimalASCVD = function() {
        var optimalPatient = $.extend(true, {}, CardiacRisk.patientInfo);
        optimalPatient.totalCholesterol = 170;
        optimalPatient.hdl = 50;
        optimalPatient.systolicBloodPressure = 110;
        optimalPatient.relatedFactors.hypertension = false;
        optimalPatient.relatedFactors.diabetic = false;
        optimalPatient.relatedFactors.smoker = false;

        return CardiacRisk.computeTenYearASCVD(optimalPatient);
    };
    CardiacRisk.computeOptimalASCVD = computeOptimalASCVD;

    /**
    * Computes the lifetime ASCVD Risk Estimate for an individual. If the individual is younger than 20 or older than
    * 59, the lifetime risk cannot be estimated. Returns the optimal risk for the individual's gender if specified.
    * @param patientInfo - patientInfo object from CardiacRisk data model
    * @param useOptimal - check to return the ASCVD risk estimate over an individual's lifetime under optimal conditions
    * @returns {*} Returns the risk score or null if not in the appropriate age range
    */
    var computeLifetimeRisk = function(patientInfo, useOptimal) {
        if (patientInfo.age < 20 || patientInfo.age > 59) { return null; }
        var ascvdRisk = 0;
        var params = {
            "male": {
                "major2": 69,
                "major1": 50,
                "elevated": 46,
                "notOptimal": 36,
                "allOptimal": 5
            },
            "female": {
                "major2": 50,
                "major1": 39,
                "elevated": 39,
                "notOptimal": 27,
                "allOptimal": 8
            }
        };

        var major = (patientInfo.totalCholesterol >= 240 ? 1 : 0) + ((patientInfo.systolicBloodPressure >= 160 ? 1 : 0) +
            (patientInfo.hypertension ? 1 : 0)) + (patientInfo.relatedFactors.smoker ? 1 : 0) +
            (patientInfo.relatedFactors.diabetes ? 1 : 0);
        var elevated = ((((patientInfo.totalCholesterol >= 200 && patientInfo.totalCholesterol < 240) ? 1 : 0) +
            ((patientInfo.systolicBloodPressure >= 140 && patientInfo.systolicBloodPressure < 160 &&
            patientInfo.relatedFactors.hypertension == false) ? 1 : 0)) >= 1 ? 1 : 0) * (major == 0 ? 1 : 0);
        var allOptimal = (((patientInfo.totalCholesterol < 180 ? 1 : 0) + ((patientInfo.systolicBloodPressure < 120 ? 1 : 0) *
            (patientInfo.relatedFactors.hypertension ? 0 : 1))) == 2 ? 1 : 0) * (major == 0 ? 1 : 0);
        var notOptimal = ((((patientInfo.totalCholesterol >= 180 && patientInfo.totalCholesterol < 200) ? 1 : 0) +
            ((patientInfo.systolicBloodPressure >= 120 && patientInfo.systolicBloodPressure < 140 &&
            patientInfo.relatedFactors.hypertension == false) ? 1 : 0)) * (elevated == 0 ? 1 : 0) * (major == 0 ? 1 : 0)) >= 1 ? 1 : 0;

        if (major > 1) { ascvdRisk = params[patientInfo.gender]["major2"]; }
        if (major === 1) { ascvdRisk = params[patientInfo.gender]["major1"]; }
        if (elevated === 1) { ascvdRisk = params[patientInfo.gender]["elevated"]; }
        if (notOptimal === 1) { ascvdRisk = params[patientInfo.gender]["notOptimal"]; }
        if (allOptimal === 1) { ascvdRisk = params[patientInfo.gender]["allOptimal"]; }

        if (useOptimal) { return patientInfo.gender === 'male' ? 5 : 8; }
        return ascvdRisk;
    };
    CardiacRisk.computeLifetimeRisk = computeLifetimeRisk;

    /**
     * Computes RRS for a patient with a potential systolic blood pressure of 10 mm/Hg lower than their current
     * systolic blood pressure
     * @method computeWhatIfSBP
     */
    var computeWhatIfSBP = function () {
        var whatIfSBP = {};
        var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
        if (patientInfoCopy.systolicBloodPressure >= 129) {
            patientInfoCopy.systolicBloodPressure = patientInfoCopy.systolicBloodPressure - 10;
        }
        else if (patientInfoCopy.systolicBloodPressure >= 120 && patientInfoCopy.systolicBloodPressure <129) {
            patientInfoCopy.systolicBloodPressure = 119;
        }
        else if (patientInfoCopy.systolicBloodPressure >= 105 && patientInfoCopy.systolicBloodPressure < 120) {
            return undefined;
        }

        var score = CardiacRisk.computeRRS(patientInfoCopy);
        whatIfSBP.value = score + '%';
        whatIfSBP.valueText = patientInfoCopy.systolicBloodPressure + ' mm/Hg';
        return whatIfSBP;
    };
    CardiacRisk.computeWhatIfSBP = computeWhatIfSBP;

    /**
     * Computes RRS for a patient in a potential scenario of not being a smoker
     * @method computeWhatIfNotSmoker
     */
    var computeWhatIfNotSmoker = function () {
        var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
        patientInfoCopy.relatedFactors.smoker = false;
        return CardiacRisk.computeRRS(patientInfoCopy);
    };
    CardiacRisk.computeWhatIfNotSmoker = computeWhatIfNotSmoker;

    /**
     * Computes RRS for a patient with potentially optimal health levels
     * @method computeWhatIfOptimal
     */
    var computeWhatIfOptimal = function () {
        var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
        patientInfoCopy.hsCReactiveProtein = 0.5;
        patientInfoCopy.totalCholesterol = 160;
        patientInfoCopy.hdl = 60;
        patientInfoCopy.ldl = 100;
        patientInfoCopy.systolicBloodPressure = 119;
        patientInfoCopy.relatedFactors.smoker = false;
        patientInfoCopy.relatedFactors.familyHeartAttackHistory = false;
        return CardiacRisk.computeRRS(patientInfoCopy);
    };
    CardiacRisk.computeWhatIfOptimal = computeWhatIfOptimal;

    /**
     * Computes patients actions to be displayed to the user.
     * @method computePatientActions
     */
    var computePatientActions = function () {

        var patientActions = {};
        if (CardiacRisk.patientInfo.totalCholesterol <= 160 &&
            CardiacRisk.patientInfo.ldl < 100 &&
            CardiacRisk.patientInfo.hdl >= 60) {

            patientActions.dietHeader = 'Continue to eat a healthy diet and exercise';
            patientActions.diet = 'A healthy diet and regular exercise can keep cholesterol ' +
            'levels optimal.';

            patientActions.doctorHeader = 'Talk to your doctor';
            patientActions.doctor = 'Discuss the need to follow up with your primary care provider to monitor your health';

            if (CardiacRisk.patientInfo.hsCReactiveProtein <= 0.5) {
                patientActions.retesting = 'Periodically retest your levels to continually monitor ' +
                'your health.';
            }
        }
        else if (CardiacRisk.patientInfo.totalCholesterol >= 160 ||
            CardiacRisk.patientInfo.ldl >= 130 ||
            CardiacRisk.patientInfo.hdl <= 60) {

            patientActions.dietHeader = 'Improve your diet and exercise more';
            patientActions.diet = 'A better diet and regular exercise can drastically ' +
            'improve your cholesterol levels.';

            patientActions.doctorHeader = 'Talk to your doctor';
            patientActions.doctor = 'Discuss statins or other medications with your primary care ' +
            'provider that can help lower cholesterol.';

            if (CardiacRisk.patientInfo.hsCReactiveProtein >= 0.5) {
                patientActions.retesting = 'Retesting in 1 to 2 weeks can help exclude temporary ' +
                'spikes in your blood levels.';
            }
        }

        return patientActions;
    };
    CardiacRisk.computePatientActions = computePatientActions;

    /**
     *  Method to generate error message text by validating availability of lab values.
     *  Checks for :
     *      1. High Sensitivity C Reactive Protein value
     *      2. Total Cholesterol Value
     *      3. HDL
     * @returns {string} Error string based on the missing lab value.
     */
    var validateLabsForMissingValueErrors = function () {
        var errorText = '';
        if (isNaN(CardiacRisk.patientInfo.hsCReactiveProtein) || CardiacRisk.patientInfo.hsCReactiveProtein.length === 0 ||
            CardiacRisk.patientInfo.hsCReactiveProtein === undefined) {
            errorText = 'Cardiac Risk cannot be calculated without a valid value for High sensitivity C-Reactive Protein.';
        }
        else if (isNaN(CardiacRisk.patientInfo.totalCholesterol) || CardiacRisk.patientInfo.totalCholesterol.length === 0 ||
            CardiacRisk.patientInfo.totalCholesterol === undefined) {
            errorText = 'Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.';
        }
        else if (isNaN(CardiacRisk.patientInfo.hdl) || CardiacRisk.patientInfo.hdl.length === 0 ||
            CardiacRisk.patientInfo.hdl === undefined) {
            errorText = 'Cardiac Risk cannot be calculated without a valid value for HDL.';
        }
        return errorText;
    };
    PatientInfo.validateLabsForMissingValueErrors = validateLabsForMissingValueErrors;

    /**
     * Method to generate error message text by checking for value bounds.
     * Checks for :
     *      1. High Sensitivity C Reactive Protein value for bounds : 0.03 - 20
     *      2. Total Cholesterol Value for bounds : 140 - 401
     *      3. HDL for bounds : 30 - 150
     * @returns {string} Error string based on out of bounds lab values.
     */
    var validateLabsForOutOfBoundsValueErrors = function () {
        var errorText = '';
        if (CardiacRisk.patientInfo.hsCReactiveProtein < 0.03) {
            errorText = 'C-Reactive Protein levels are too low to return a cardiac risk score.';
        }
        else if (CardiacRisk.patientInfo.hsCReactiveProtein > 20) {
            errorText = 'C-Reactive Protein levels are too high to return a cardiac risk score.';
        }
        else if (CardiacRisk.patientInfo.totalCholesterol < 140) {
            errorText = 'Total Cholesterol levels are too low to return a cardiac risk score.';
        }
        else if (CardiacRisk.patientInfo.totalCholesterol > 401) {
            errorText = 'Total Cholesterol levels are too high to return a cardiac risk score.';
        }
        else if (CardiacRisk.patientInfo.hdl < 30) {
            errorText = 'HDL levels are too low to return a cardiac risk score.';
        }
        else if (CardiacRisk.patientInfo.hdl > 150) {
            errorText = 'HDL levels are too high to return a cardiac risk score.';
        }
        return errorText;
    };
    PatientInfo.validateLabsForOutOfBoundsValueErrors = validateLabsForOutOfBoundsValueErrors;

    /**
     * Builds the strings for display of whatIfOptimalValues based on the score.
     * @param score
     * @method buildWhatIfOptimalValues
     */
    var buildWhatIfOptimalValues = function (score) {

        var whatIfOptimalValues = {};
        whatIfOptimalValues.value = score + '%';

        if(CardiacRisk.patientInfo.relatedFactors.smoker === true && !CardiacRisk.optimalLabs()) {
            whatIfOptimalValues.valueText = ' if you quit smoking and all levels were optimal';
        }
        else if (CardiacRisk.patientInfo.relatedFactors.smoker === false &&
            !CardiacRisk.optimalLabs()) {
            whatIfOptimalValues.valueText = ' if all levels were optimal';
        }
        else if (CardiacRisk.patientInfo.relatedFactors.smoker === false &&
            CardiacRisk.optimalLabs() &&
            CardiacRisk.patientInfo.relatedFactors.familyHeartAttackHistory === true &&
            score > 5) {
            whatIfOptimalValues.value = '';
            whatIfOptimalValues.valueText = 'Your risk is the lowest it can be based on the supplied information';
        }
        else if (CardiacRisk.optimalLabs()) {
            whatIfOptimalValues.value = '';
            whatIfOptimalValues.valueText = 'All levels are currently optimal';
        }


        return whatIfOptimalValues;
    };
    CardiacRisk.buildWhatIfOptimalValues = buildWhatIfOptimalValues;

    /**
     * Builds the strings for display of whatIfNotSmoker based on the score.
     * @param score
     * @method buildWhatIfNotSmoker
     */
    var buildWhatIfNotSmoker = function (score) {
        var whatIfNotSmoker = {};
        whatIfNotSmoker.value = score + '%';
        return whatIfNotSmoker;
    };
    CardiacRisk.buildWhatIfNotSmoker = buildWhatIfNotSmoker;

    /**
     * Checks if the Cardiac Risk data model has sufficient data to compute the RRS.
     * Checks for :
     *    1. Systolic Blood Pressure
     *    2. Patients Smoking status
     *    3. Patients family heart attach history.
     * @returns {boolean} Indicating if RRS can be calculated.
     */
    var canCalculateCardiacRiskScore = function () {

        if (CardiacRisk.isValidSysBP(CardiacRisk.patientInfo.systolicBloodPressure) &&
            CardiacRisk.patientInfo.relatedFactors.smoker !== undefined &&
            CardiacRisk.patientInfo.relatedFactors.familyHeartAttackHistory !== undefined) {
            return true;
        }
        return false;

    };
    CardiacRisk.canCalculateCardiacRiskScore = canCalculateCardiacRiskScore;

    /**
     * Checks if the Cardiac Risk data model has all the labs available. This is used to verify is the service returned
     * atleast 1 value per lab.
     * @returns {boolean} : Indicating if all labs are available.
     */
    var isLabsNotAvailable = function () {
        if (CardiacRisk.patientInfo.hsCReactiveProtein === undefined ||
            CardiacRisk.patientInfo.totalCholesterol === undefined ||
            CardiacRisk.patientInfo.hdl === undefined ||
            CardiacRisk.patientInfo.ldl === undefined ||
            CardiacRisk.patientInfo.systolicBloodPressure === undefined) {
            return true;
        }
        return false;
    };
    CardiacRisk.isLabsNotAvailable = isLabsNotAvailable;

    /**
     * Checks if the Cardiac Risk data model has the required labs available. This check excludes systolic BP since
     * the user can enter this value using the UI.
     * @returns {boolean} : Indicating if required labs are available.
     */
    var isRequiredLabsNotAvailable = function () {
        if (CardiacRisk.patientInfo.hsCReactiveProtein === undefined ||
            CardiacRisk.patientInfo.totalCholesterol === undefined ||
            CardiacRisk.patientInfo.hdl === undefined) {
            return true;
        }
        return false;
    };
    CardiacRisk.isRequiredLabsNotAvailable = isRequiredLabsNotAvailable;

    /**
     * Validates the provided systolic blood pressure value for bounds and availability.
     * @param currentSysBP : User seen value for systolic blood pressure.
     * @returns {boolean} Indicates if the systolic blood pressure value is usable.
     */
    var isValidSysBP = function (currentSysBP) {

        if (!isNaN(currentSysBP) && currentSysBP !== undefined && currentSysBP >=105 && currentSysBP <=200) {
            return true;
        }
        return false;

    };
    CardiacRisk.isValidSysBP = isValidSysBP;

    /**
     * Computes if the lab values are optimal and returns a boolean.
     * @returns {boolean}
     * @method optimalLabs
     */
    var optimalLabs = function () {
        var optimal = false;
        if (CardiacRisk.patientInfo.hsCReactiveProtein >= 0.03 &&
            CardiacRisk.patientInfo.hsCReactiveProtein <= 0.9 &&
            CardiacRisk.patientInfo.totalCholesterol >= 140 &&
            CardiacRisk.patientInfo.totalCholesterol <= 199 &&
            CardiacRisk.patientInfo.hdl >= 60 &&
            CardiacRisk.patientInfo.hdl <= 150 &&
            CardiacRisk.patientInfo.ldl >= 50 &&
            CardiacRisk.patientInfo.ldl <= 100) {
            optimal = true;
        }
        return optimal;
    };
    CardiacRisk.optimalLabs = optimalLabs;

    /**
     * Validates the CardiacRisk model properties for the required values to compute RRS. If values are missing, an error
     * string is generated as a response.
     * @returns {string} Error string indicating problem with the model data availability.
     * @method validateModelForErrors
     */
    var validateModelForErrors = function () {
        var errorText = '';
        if (CardiacRisk.patientInfo.age < 45 || CardiacRisk.patientInfo.age > 80) {
            errorText = 'Cardiac risk can only be calculated for patients aged 45-80 years old.';
        }
        else if (!(CardiacRisk.patientInfo.gender.toLowerCase() === 'male' || CardiacRisk.patientInfo.gender.toLowerCase() === 'female')) {
            errorText = 'Cardiac Risk Score cannot be calculated for indeterminate gender.';
        }
        if (errorText.length === 0) {
            errorText = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
        }
        if (errorText.length === 0) {
            errorText = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
        }
        return errorText;
    };
    CardiacRisk.validateModelForErrors = validateModelForErrors;

    // Visibility for testing purposes w/ window
    window.CardiacRisk = CardiacRisk;
    window.CardiacRisk.patientInfo = PatientInfo;
    CardiacRisk._window = window;
}(this));
