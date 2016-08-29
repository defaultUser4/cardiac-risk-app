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
     * LOINC Codes used : 'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
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
                            $or: ['http://loinc.org|14647-2', 'http://loinc.org|2093-3',
                                'http://loinc.org|2085-9', 'http://loinc.org|8480-6',
                                'http://loinc.org|55284-4'
                            ]
                        }
                    }
                });
                $.when(patientQuery, labsQuery)
                    .done(function (patientData, labResults) {

                        PatientInfo.firstName = patientData.name[0].given.join(' ');
                        PatientInfo.lastName = patientData.name[0].family.join(' ');
                        PatientInfo.gender = patientData.gender;
                        PatientInfo.dateOfBirth = new Date((patientData.birthDate).replace(/-/g, '\/'));
                        PatientInfo.age = CardiacRisk.computeAgeFromBirthDate(new Date(PatientInfo.dateOfBirth.valueOf()));

                        CardiacRisk.patientInfo = PatientInfo;

                        var relatedFactors = {};
                        /* Default to undefined since we want to remove error state on radio buttons on the first go */
                        relatedFactors.smoker = undefined;
                        relatedFactors.race = undefined;
                        relatedFactors.hypertensive = undefined;
                        relatedFactors.diabetic = undefined;
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

        CardiacRisk.patientInfo.totalCholesterol = CardiacRisk.getCholesterolValue(labsByLoincCodes('14647-2', '2093-3'));
        CardiacRisk.patientInfo.hdl = CardiacRisk.getCholesterolValue(labsByLoincCodes('2085-9'));
        CardiacRisk.patientInfo.systolicBloodPressure = CardiacRisk.getSystolicBloodPressureValue(labsByLoincCodes('55284-4'));
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
     * Fetches current Systolic Blood Pressure
     * @method getSystolicBloodPressureValue
     * @param {object} sysBPObservations - sysBloodPressure array object with valueQuantity elements having units and value.
     */
    var getSystolicBloodPressureValue = function (sysBPObservations) {
        var formattedSysBPObservations = [];
        sysBPObservations.forEach(function(observation){
            var systolicBP = observation.component.find(function(component){
                return component.code.coding.find(function(coding) {
                    return coding.code === "8480-6";
                });
            });
            if (systolicBP) {
                observation.valueQuantity = systolicBP.valueQuantity;
                formattedSysBPObservations.push(observation);
            }
        });
        return CardiacRisk.getFirstValidDataPointValueFromObservations(formattedSysBPObservations, function (dataPoint) {
            if (dataPoint.valueQuantity.unit === 'mm[Hg]' || dataPoint.valueQuantity.unit === 'mmHg') {
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
    * Computes the ASCVD Risk Estimate for an individual over the next 10 years.
    * @param patientInfo - patientInfo object from CardiacRisk data model
    */
    var computeTenYearASCVD = function(patientInfo) {
        var lnAge = Math.log(patientInfo.age);
        var lnTotalChol = Math.log(patientInfo.totalCholesterol);
        var lnHdl = Math.log(patientInfo.hdl);
        var trlnsbp = patientInfo.relatedFactors.hypertensive ? Math.log(parseFloat(patientInfo.systolicBloodPressure)) : 0;
        var ntlnsbp = patientInfo.relatedFactors.hypertensive ? 0 : Math.log(parseFloat(patientInfo.systolicBloodPressure));
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

            var pct = (1 - Math.pow(s010Ret, Math.exp(predictRet - mnxbRet)));
            return Math.round(pct * 100);
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
        optimalPatient.relatedFactors.hypertensive = false;
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
            (patientInfo.relatedFactors.hypertensive ? 1 : 0)) + (patientInfo.relatedFactors.smoker ? 1 : 0) +
            (patientInfo.relatedFactors.diabetic ? 1 : 0);
        var elevated = ((((patientInfo.totalCholesterol >= 200 && patientInfo.totalCholesterol < 240) ? 1 : 0) +
            ((patientInfo.systolicBloodPressure >= 140 && patientInfo.systolicBloodPressure < 160 &&
            patientInfo.relatedFactors.hypertensive === false) ? 1 : 0)) >= 1 ? 1 : 0) * (major === 0 ? 1 : 0);
        var allOptimal = (((patientInfo.totalCholesterol < 180 ? 1 : 0) + ((patientInfo.systolicBloodPressure < 120 ? 1 : 0) *
            (patientInfo.relatedFactors.hypertensive ? 0 : 1))) == 2 ? 1 : 0) * (major === 0 ? 1 : 0);
        var notOptimal = ((((patientInfo.totalCholesterol >= 180 && patientInfo.totalCholesterol < 200) ? 1 : 0) +
            ((patientInfo.systolicBloodPressure >= 120 && patientInfo.systolicBloodPressure < 140 &&
            patientInfo.relatedFactors.hypertensive === false) ? 1 : 0)) * (elevated === 0 ? 1 : 0) * (major === 0 ? 1 : 0)) >= 1 ? 1 : 0;

        if (major > 1) { ascvdRisk = params[patientInfo.gender].major2; }
        if (major === 1) { ascvdRisk = params[patientInfo.gender].major1; }
        if (elevated === 1) { ascvdRisk = params[patientInfo.gender].elevated; }
        if (notOptimal === 1) { ascvdRisk = params[patientInfo.gender].notOptimal; }
        if (allOptimal === 1) { ascvdRisk = params[patientInfo.gender].allOptimal; }

        if (useOptimal) { return patientInfo.gender === 'male' ? 5 : 8; }
        return ascvdRisk;
    };
    CardiacRisk.computeLifetimeRisk = computeLifetimeRisk;

    /**
     * Computes ASCVD risk for a patient with a potential systolic blood pressure of 10 mm/Hg lower than their current
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

        var score = CardiacRisk.computeTenYearASCVD(patientInfoCopy);
        whatIfSBP.value = score + '%';
        whatIfSBP.valueText = patientInfoCopy.systolicBloodPressure + ' mm/Hg';
        return whatIfSBP;
    };
    CardiacRisk.computeWhatIfSBP = computeWhatIfSBP;

    /**
     * Computes ASCVD risk for a patient in a potential scenario of not being a smoker
     * @method computeWhatIfNotSmoker
     */
    var computeWhatIfNotSmoker = function () {
        var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
        patientInfoCopy.relatedFactors.smoker = false;
        return CardiacRisk.computeTenYearASCVD(patientInfoCopy);
    };
    CardiacRisk.computeWhatIfNotSmoker = computeWhatIfNotSmoker;

    /**
     * Computes ASCVD risk for a patient with potentially optimal health levels
     * @method computeWhatIfOptimal
     */
    var computeWhatIfOptimal = function () {
        var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
        patientInfoCopy.totalCholesterol = 160;
        patientInfoCopy.hdl = 60;
        patientInfoCopy.systolicBloodPressure = 119;
        patientInfoCopy.relatedFactors.smoker = false;
        return CardiacRisk.computeTenYearASCVD(patientInfoCopy);
    };
    CardiacRisk.computeWhatIfOptimal = computeWhatIfOptimal;

    /**
     * Computes patients actions to be displayed to the user.
     * @method computePatientActions
     */
    var computePatientActions = function () {

        var patientActions = {};
        if (CardiacRisk.patientInfo.totalCholesterol <= 160 && CardiacRisk.patientInfo.hdl >= 60) {

            patientActions.dietHeader = 'Continue to eat a healthy diet and exercise';
            patientActions.diet = 'A healthy diet and regular exercise can keep cholesterol ' +
            'levels optimal.';

            patientActions.doctorHeader = 'Talk to your doctor';
            patientActions.doctor = 'Discuss the need to follow up with your primary care provider to monitor your health';
        }
        else if (CardiacRisk.patientInfo.totalCholesterol >= 160 || CardiacRisk.patientInfo.hdl <= 60) {

            patientActions.dietHeader = 'Improve your diet and exercise more';
            patientActions.diet = 'A better diet and regular exercise can drastically ' +
            'improve your cholesterol levels.';

            patientActions.doctorHeader = 'Talk to your doctor';
            patientActions.doctor = 'Discuss statins or other medications with your primary care ' +
            'provider that can help lower cholesterol.';
        }

        return patientActions;
    };
    CardiacRisk.computePatientActions = computePatientActions;

    /**
     *  Method to generate error message text by validating availability of lab values.
     *  Checks for :
     *      1. Total Cholesterol Value
     *      2. HDL
     * @returns {string} Error string based on the missing lab value.
     */
    var validateLabsForMissingValueErrors = function () {
        var errorText = '';

        if (isNaN(CardiacRisk.patientInfo.totalCholesterol) || CardiacRisk.patientInfo.totalCholesterol.length === 0 ||
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
     *   1. Total Cholesterol Value for bounds : 140 - 401
     *   2. HDL for bounds : 30 - 150
     * @returns {string} Error string based on out of bounds lab values.
     */
    var validateLabsForOutOfBoundsValueErrors = function () {
        var errorText = '';

        if (CardiacRisk.patientInfo.totalCholesterol < 140) {
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
    * Checks if the ASCVD data model has sufficient data to compute ASCVD score.
    * Checks for :
    *   1. Systolic Blood Pressure
    *   2. Patients hypertensive status
    *   3. Patients race
    *   4. Patients diabetic status
    *   5. Patients smoker status
    * @returns {boolean} Indicating if ASCVD Estimate can be calculated.
    */
    var canCalculateASCVDScore = function () {
        if (CardiacRisk.isValidSysBP(CardiacRisk.patientInfo.systolicBloodPressure) &&
            CardiacRisk.patientInfo.relatedFactors.hypertensive !== undefined &&
            CardiacRisk.patientInfo.relatedFactors.race !== undefined &&
            CardiacRisk.patientInfo.relatedFactors.diabetic !== undefined &&
            CardiacRisk.patientInfo.relatedFactors.smoker !== undefined) {
            return true;
        }
        return false;
    };
    CardiacRisk.canCalculateASCVDScore = canCalculateASCVDScore;

    /**
     * Checks if the Cardiac Risk data model has all the labs available. This is used to verify is the service returned
     * at least 1 value per lab.
     * @returns {boolean} : Indicating if all labs are available.
     */
    var isLabsNotAvailable = function () {
        if (CardiacRisk.patientInfo.totalCholesterol === undefined ||
            CardiacRisk.patientInfo.hdl === undefined ||
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
        if (CardiacRisk.patientInfo.totalCholesterol === undefined ||
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
        if (CardiacRisk.patientInfo.totalCholesterol >= 140 &&
            CardiacRisk.patientInfo.totalCholesterol <= 199 &&
            CardiacRisk.patientInfo.hdl >= 60 &&
            CardiacRisk.patientInfo.hdl <= 150) {
            optimal = true;
        }
        return optimal;
    };
    CardiacRisk.optimalLabs = optimalLabs;

    /**
     * Validates the CardiacRisk model properties for the required values to compute ASCVD risk. If values are missing, an error
     * string is generated as a response.
     * @returns {string} Error string indicating problem with the model data availability.
     * @method validateModelForErrors
     */
    var validateModelForErrors = function () {
        var errorText = '';
        if (CardiacRisk.patientInfo.age < 20 || CardiacRisk.patientInfo.age > 79) {
            errorText = 'ASCVD risk can only be estimated for patients aged 20-79 years old.';
        }
        else if (!(CardiacRisk.patientInfo.gender.toLowerCase() === 'male' || CardiacRisk.patientInfo.gender.toLowerCase() === 'female')) {
            errorText = 'ASCVD risk cannot be estimated for indeterminate gender.';
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


  // UI Setup after the DOM is ready
  function initialUISetup() {
    $(window).resize(function () {
      adjustRelatedFactorsSize();

      var $leftContentBox = $('.contentBoxLeft');
      if ($leftContentBox.width() < 490 && $leftContentBox.width() > 377) {
        adjustRangeSliderThumbPosition();
      }
    });
  }

  CardiacRisk.fetchDataAndPopulateCardiacRiskObject().then(function () {
    //Hide or Show Patient Demographics banner.
    if (CardiacRisk.hideDemographicsBanner) {
      $('#patientDemographics').addClass('contentHidden');
    }
    else {
      $('#patientDemographics').removeClass('contentHidden');
      updatePatientDemographicsBanner();
    }

    if (validData()) {
      //Since service call has succeeded we hide the loading indicator and enable the content.
      $('#pageLoading').removeClass().addClass('contentHidden');
      $('#pageContent').removeClass().addClass('contentLayout');
      updatePatientActions();
      checkForIncompleteState();
      createRangeSliderGraphs();
      addEventListeners();
      adjustRelatedFactorsSize();
    }
    else {
      return;
    }
  });

  /**
   * Updates the patient demographics banner with data from the model.
   */
  function updatePatientDemographicsBanner() {
    $('#patientName').text(CardiacRisk.patientInfo.firstName + ' ' + CardiacRisk.patientInfo.lastName);
    $('#patientAge').text(CardiacRisk.patientInfo.age + 'yrs');
    if (CardiacRisk.patientInfo.gender === 'male') {
      $('#patientGender').text('M');
    }
    else if (CardiacRisk.patientInfo.gender === 'female') {
      $('#patientGender').text('F');
    }
    var date = CardiacRisk.patientInfo.dateOfBirth;
    var dobString = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    $('#patientDOB').text(dobString);
  }

  /**
   * Updates the patient actions section based on the available lab values.
   */
  function updatePatientActions() {
    var patientActions = CardiacRisk.computePatientActions();
    $('#contentDietExerciseHeader').text(patientActions.dietHeader);
    $('#contentDietExercise').text(patientActions.diet);
    $('#contentDoctorHeader').text(patientActions.doctorHeader);
    $('#contentDoctor').text(patientActions.doctor);
    $('#contentRetesting').text(patientActions.retesting);
  }

  /**
   * Checks for the validity of available parameters to calculate the ASCVD risk.
   * This method will display an Incomplete state UI at the beginning of the app since the availability of
   * patients related factors is unknown.
   */
  function checkForIncompleteState() {
    if (!CardiacRisk.canCalculateASCVDScore()) {
      $('#resultsInfo').removeClass('contentHidden');
      $('#resultsSliders').removeClass('contentHidden');
      $('#riskBar').removeClass().addClass('riskBarIncomplete');
      $('#riskMessage').text('Incomplete');
      $('#riskDescriptionText').text('Related factors must be completed in order to calculate your cardiac risk score.');
      $('#riskDescriptionValue').text('');
      $('#containerPatientActions').removeClass().addClass('contentHiddenVisibility');
      $('#whatIfContainer').removeClass().addClass('contentHidden');
      $('#horizontalRule').removeClass().addClass('contentHidden');
    }
      $('#sbpInput').val(CardiacRisk.patientInfo.systolicBloodPressure);
    onSBPInput();
  }

  /**
   * This method validates the available data gathered from the service response.
   * This method also updates the UI with errors discovered in the form of Error Messages.
   * Looks for :
   *    1. Age between 45 - 80 range
   *    2. Gender 'male' or 'female' any other value is considered as indeterminate gender and an error is displayed.
   *    3. Looks for missingLabValues
   *    4. Looks for outOfBoundsValues
   * @returns {boolean} Indicating if the data is valid for the UI to be loaded.
   */
  function validData() {
    var errorText = CardiacRisk.validateModelForErrors();
    if (errorText.length > 0) {
      processError(errorText);
      return false;
    }
    return true;
  }

  /**
   * This method updates the UI to display an error with the received text.
   * @param errorText
   */
  function processError(errorText) {
    if (CardiacRisk.shouldProcessError) {
      CardiacRisk.shouldProcessError = false;
      $('#pageLoading').removeClass().addClass('contentHidden');
      $('#pageError').removeClass().addClass('contentErrorLayout');
      $('#pageContent').removeClass().addClass('contentHidden');
      $('#pageErrorLabel').text(errorText);
    }
  }

  /**
   * This method updates the UI components.
   */
  function updateUI() {
    $('#containerPatientActions').removeClass().addClass('patientActions');
    $('#whatIfContainer').removeClass().addClass('whatIfContainerLayout');
    $('#horizontalRule').removeClass().addClass('hrStyle');

    updateUICardiacRiskScore();
    updateUIWhatIfSystolicBloodPressure();
    updateUIWhatIfNotSmoker();
    updateUIWhatIfOptimalValues();
    updateASCVDRiskEstimates();

    adjustRelatedFactorsSize();
  }

  /**
   * Add event listeners to the UI once the dom is ready.
   */
  function addEventListeners() {
    $('#sbpInput').keypress(function(event) {return isNumberKey(event);});
    $('#sbpInput').on('focusout', sbpInputFocusOutHandler);
    $('[name="smoker"]').change(onSmokerInput);
    $('[name="hypertensive"]').change(onHypertensiveInput);
    $('[name="race"]').change(onRaceInput);
    $('[name="diabetic"]').change(onDiabeticInput);
  }

  /**
   * Event listener method for systolic blood pressure input box.
   * This method will check for :
   *    1. valid systolic blood pressure value
   *    2. update the CardiacRisk data model
   *    3. update UI if the ASCVD risk can be calculated.
   */
  function onSBPInput() {
    var systolicBPValue = parseFloat(document.getElementById('sbpInput').value);
    if (CardiacRisk.isValidSysBP(systolicBPValue))
    {
      // Save the user viewed blood pressure value in our dataObject for future references.
      CardiacRisk.patientInfo.systolicBloodPressure = systolicBPValue;
      $('#legendSysBPError').removeClass().addClass('relatedFactorsErrorsHidden');
      $('#asteriskSBP').removeClass().addClass('contentHidden');
      $('#sbpInput').val(systolicBPValue);

      if (CardiacRisk.canCalculateASCVDScore()) {
        updateUI();
      }
    }
    else if (CardiacRisk.patientInfo.systolicBloodPressure !== undefined) {
        $('#sbpInput').val(CardiacRisk.patientInfo.systolicBloodPressure);
      }
    else if (CardiacRisk.patientInfo.systolicBloodPressure === undefined) {
      $('#legendSysBPError').removeClass().addClass('relatedFactorsErrors');
      $('#asteriskSBP').removeClass().addClass('asterisk');
    }
  }

  /**
   * Event listener method for the smoker status radio button value change.
   */
  function onSmokerInput() {
    if (CardiacRisk.patientInfo.relatedFactors.smoker === undefined) {
      $('#legendSmokerError').toggleClass('relatedFactorsErrors relatedFactorsErrorsHidden');
      $('#asteriskSmoker').removeClass().addClass('contentHidden');
    }

    if ($(this).val() === 'yes') {
      // Save the user viewed smoker condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.smoker = true;
      $('#contentSmokingHeader').text('Quit smoking');
      $('#contentSmoking').text('By stopping smoking, you can drastically decrease your ' +
      'heart disease risk!');
    } else {
      // Save the user viewed smoker condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.smoker = false;
      $('#whatIfNotSmoker').addClass('contentHidden');

      $('#contentSmokingHeader').text('Stay smoke free');
      $('#contentSmoking').text('By not smoking, you are keeping your ' +
      'heart disease risk low!');
    }

    if (CardiacRisk.canCalculateASCVDScore()) {
      updateUI();
    }
  }

  /**
   * Event listener method for the hypertensive status radio button value change.
   */
  function onHypertensiveInput() {
    if (CardiacRisk.patientInfo.relatedFactors.hypertensive === undefined) {
      $('#legendHypertensionError').toggleClass('relatedFactorsErrors relatedFactorsErrorsHidden');
      $('#asteriskHypertension').removeClass().addClass('contentHidden');
    }

    if ($(this).val() === 'yes') {
      // Save the user viewed hypertensive condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.hypertensive = true;
    } else {
      // Save the user viewed hypertensive condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.hypertensive = false;
    }

    if (CardiacRisk.canCalculateASCVDScore()) {
      updateUI();
    }
  }

  /**
   * Event listener method for the race status radio button value change.
   */
  function onRaceInput() {
    if (CardiacRisk.patientInfo.relatedFactors.race === undefined) {
      $('#legendRaceError').toggleClass('relatedFactorsErrors relatedFactorsErrorsHidden');
      $('#asteriskRace').removeClass().addClass('contentHidden');
    }

    if ($(this).val() === 'white') {
      // Save the user viewed race condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.race = 'white';
    } else if ($(this).val() === 'aa') {
      // Save the user viewed race condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.race = 'aa';
    } else {
      CardiacRisk.patientInfo.relatedFactors.race = 'other';
    }

    if (CardiacRisk.canCalculateASCVDScore()) {
      updateUI();
    }
  }

  /**
   * Event listener method for the diabetic status radio button value change.
   */
  function onDiabeticInput() {
    if (CardiacRisk.patientInfo.relatedFactors.diabetic === undefined) {
      $('#legendDiabeticError').toggleClass('relatedFactorsErrors relatedFactorsErrorsHidden');
      $('#asteriskDiabetic').removeClass().addClass('contentHidden');
    }

    if ($(this).val() === 'yes') {
      // Save the user viewed diabetic condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.diabetic = true;
    } else {
      // Save the user viewed diabetic condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.diabetic = false;
    }

    if (CardiacRisk.canCalculateASCVDScore()) {
      updateUI();
    }
  }

  /**
   * Method to update the UI for cardiac risk score based on the ASCVD risk estimation.
   * Updates components:
   *    1. Risk Description
   *    2. Risk Bar
   */
  function updateUICardiacRiskScore() {
    var score = CardiacRisk.computeTenYearASCVD(CardiacRisk.patientInfo);

    $('#riskDescriptionText').text('Your chance of having a heart attack, stroke, or other ' +
    'heart disease event at some point in the next 10 years is ');
    $('#riskDescriptionValue').text(score + '%');

    var $riskBar = $('#riskBar');
    var $riskMessage = $('#riskMessage');
    if (score < 5) {
      $riskBar.removeClass().addClass('riskBarLowRisk');
      $riskMessage.text('Low Risk');
    } else if (score >= 5 && score < 10) {
      $riskBar.removeClass().addClass('riskBarLowModerateRisk');
      $riskMessage.text('Low-Moderate Risk');
    } else if (score >= 10 && score < 20) {
      $riskBar.removeClass().addClass('riskBarModerateRisk');
      $riskMessage.text('Moderate Risk');
    } else if (score >= 20) {
      $riskBar.removeClass().addClass('riskBarHighRisk');
      $riskMessage.text('High Risk');
    }
  }

  function updateASCVDRiskEstimates() {
    var tenYearASCVDScore = CardiacRisk.computeTenYearASCVD(CardiacRisk.patientInfo);
    var tenYearASCVDOptimalScore = CardiacRisk.computeOptimalASCVD();
    var lifetimeASCVDScore = CardiacRisk.computeLifetimeRisk(CardiacRisk.patientInfo, false);
    var lifetimeASCVDOptimalScore = CardiacRisk.computeLifetimeRisk(CardiacRisk.patientInfo, true);

    if (tenYearASCVDScore === null || tenYearASCVDOptimalScore === null) {
      $('#tenYearASCVDEstimate').text('ASCVD 10-year Risk Estimate can only be computed for those in the age' +
          ' range of 20-79');
      $('#tenYearASCVDOptimalEstimate').text('ASCVD 10-year Risk Estimate can only be computed for those in the age' +
          ' range of 20-79');
    } else {
      $('#tenYearASCVDEstimate').text('ASCVD 10-year: ' + tenYearASCVDScore + '%');
      $('#tenYearASCVDOptimalEstimate').text('ASCVD 10-year (optimal): ' + tenYearASCVDOptimalScore + '%');
    }

    if (lifetimeASCVDScore === null || lifetimeASCVDOptimalScore === null) {
      $('#lifetimeASCVDEstimate').addClass('contentHidden');
      $('#lifetimeASCVDOptimalEstimate').addClass('contentHidden');
    } else {
      $('#lifetimeASCVDEstimate').text('Lifetime ASCVD Risk Estimate: ' + lifetimeASCVDScore + '%');
      $('#lifetimeASCVDOptimalEstimate').text('Lifetime ASCVD Risk Estimate (optimal conditions): ' +
          lifetimeASCVDOptimalScore + '%');
    }
  }

  /**
   * Method to update UI based on the related factors form input.
   */
  function updateUIWhatIfSystolicBloodPressure() {
    var whatIfSBPResponse = CardiacRisk.computeWhatIfSBP();
    if (whatIfSBPResponse === undefined) {
      $('#whatIfSBP').addClass('contentHidden');
    }
    else {
      $('#whatIfSBP').removeClass('contentHidden');
      $('#whatIfSBPValue').text(whatIfSBPResponse.value);
      $('#whatIfSBPValueText').text(whatIfSBPResponse.valueText);
    }
  }

  /**
   * Method to update UI based on the related factors form input.
   */
  function updateUIWhatIfNotSmoker() {
    if (CardiacRisk.patientInfo.relatedFactors.smoker === true) {
      var whatIfNotSmokerScore = CardiacRisk.computeWhatIfNotSmoker();
      var whatIfNotSmoker = CardiacRisk.buildWhatIfNotSmoker(whatIfNotSmokerScore);
      $('#whatIfNotSmoker').removeClass('contentHidden');
      $('#whatIfNoSmokerValue').text(whatIfNotSmoker.value);
    }
    else {
      $('#whatIfNotSmoker').addClass('contentHidden');
    }
  }

  /**
   * Method to update UI based on the related factors form input.
   */
  function updateUIWhatIfOptimalValues() {
    var whatIfOptimalScore = CardiacRisk.computeWhatIfOptimal();
    var whatIfOptimalValues = CardiacRisk.buildWhatIfOptimalValues(whatIfOptimalScore);

    $('#whatIfOptimalValue').text(whatIfOptimalValues.value);
    $('#whatIfOptimalValueText').text(whatIfOptimalValues.valueText);
  }

  /**
   * Method to create the graphs for Lab values.
   */
  function createRangeSliderGraphs() {
    buildRangeSliderDataModel();
    createCholesterolSlider();
    createHDLSlider();
  }

  /**
   * Method to create the Total Cholesterol slider based on the totalCholesterol value from the
   * Cardiac Risk data model.
   */
  function createCholesterolSlider() {
    var thumbDisplayText = '', thumbBackgroundColor = '', thumbTextColor = '';
    if (CardiacRisk.patientInfo.totalCholesterol < 200) {
      thumbDisplayText = CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[0];
      thumbBackgroundColor = CardiacRisk.colorClasses.lowRisk;
    }
    else if (CardiacRisk.patientInfo.totalCholesterol >= 200 && CardiacRisk.patientInfo.totalCholesterol < 240) {
      thumbDisplayText = CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[1];
      thumbBackgroundColor = CardiacRisk.colorClasses.moderateRisk;
    }
    else if (CardiacRisk.patientInfo.totalCholesterol >= 240) {
      thumbDisplayText = CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[2];
      thumbBackgroundColor = CardiacRisk.colorClasses.highRisk;
      thumbTextColor = CardiacRisk.colorClasses.rangeSliderThumbWhiteText;
    }

    CardiacRisk.graphData.totalCholesterolSliderData.thumbDisplayText = thumbDisplayText;
    CardiacRisk.graphData.totalCholesterolSliderData.value = CardiacRisk.patientInfo.totalCholesterol;

    generateRangeSlider(CardiacRisk.graphData.totalCholesterolSliderData);
    changeBarBackgroundColor(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.grayBarColor);

    changeThumbBackgroundColor(CardiacRisk.graphData.totalCholesterolSliderData.id, thumbBackgroundColor);
    changeThumbTextColor(CardiacRisk.graphData.totalCholesterolSliderData.id, thumbTextColor);
  }

  /**
   * Method to create the HDL slider based on the hdl value from the
   * Cardiac Risk data model.
   */
  function createHDLSlider() {
    var thumbDisplayText = '', thumbBackgroundColor = '', thumbTextColor = '';
    if ((CardiacRisk.patientInfo.hdl < 40 && CardiacRisk.patientInfo.gender === 'male') ||
        (CardiacRisk.patientInfo.hdl < 50 && CardiacRisk.patientInfo.gender === 'female')) {
      thumbDisplayText = CardiacRisk.graphData.hdlSliderData.toolTipData.keys[2];
      thumbBackgroundColor = CardiacRisk.colorClasses.highRisk;
      thumbTextColor = CardiacRisk.colorClasses.rangeSliderThumbWhiteText;
    }
    else if ((CardiacRisk.patientInfo.hdl >= 40 && CardiacRisk.patientInfo.hdl < 60 && CardiacRisk.patientInfo.gender === 'male') ||
        (CardiacRisk.patientInfo.hdl >= 50 && CardiacRisk.patientInfo.hdl < 60 && CardiacRisk.patientInfo.gender === 'female')) {
      thumbDisplayText = CardiacRisk.graphData.hdlSliderData.toolTipData.keys[1];
      thumbBackgroundColor = CardiacRisk.colorClasses.moderateRisk;
    }
    else if (CardiacRisk.patientInfo.hdl >= 60) {
      thumbDisplayText = CardiacRisk.graphData.hdlSliderData.toolTipData.keys[0];
      thumbBackgroundColor = CardiacRisk.colorClasses.lowRisk;
    }

    CardiacRisk.graphData.hdlSliderData.thumbDisplayText = thumbDisplayText;
    CardiacRisk.graphData.hdlSliderData.value = CardiacRisk.patientInfo.hdl;
    generateRangeSlider(CardiacRisk.graphData.hdlSliderData);
    changeBarBackgroundColor(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);

    changeThumbBackgroundColor(CardiacRisk.graphData.hdlSliderData.id, thumbBackgroundColor);
    changeThumbTextColor(CardiacRisk.graphData.hdlSliderData.id, thumbTextColor);
  }

  /**
   * This method updates the systolic blood pressure text box with the previous sysBP value if there is no value present.
   * @method sbpInputFocusOutHandler
   */
  function sbpInputFocusOutHandler() {
    if ($(this).val().length < 3)
    {
      $(this).val(CardiacRisk.patientInfo.systolicBloodPressure);
    }
  }

  /**
   * This method stops the user from entering any non numeric characters in the input text.
   * @param keyValue Entered digit.
   * @returns {boolean} Returns if the digit can be added to the string.
   */
  function isNumberKey(keyValue) {
    var charCode = (keyValue.which) ? keyValue.which : event.keyCode;
    if (charCode === 13 || (charCode > 31 && (charCode < 48 || charCode > 57))) {
      return false;
    }
    $sbpInput = $('#sbpInput');
    var sbpValue = $sbpInput.val();
    if (sbpValue.length === 2) {
      $sbpInput.val(sbpValue + String.fromCharCode(charCode));
      onSBPInput();
    }

    return true;
  }

  /**
   * This method adjusts width of the right column components in the layout to style them on resize.
   */
  function adjustRelatedFactorsSize() {
      var patientActionsWidth = $('#containerPatientActions').width();
      $('#containerPatientDetails').width(patientActionsWidth);
      var contentRightBottomWidth = $('#contentBoxRightBottom').width();
      $('#contentBoxRightTop').width(contentRightBottomWidth);
  }

  /**
   * This method updates the thumb position based on the resizing of page and resizing of the bar in the graph.
   */
  function adjustRangeSliderThumbPosition() {
    updateThumbPosition(CardiacRisk.graphData.totalCholesterolSliderData.id,
        CardiacRisk.graphData.totalCholesterolSliderData.value,
        CardiacRisk.graphData.totalCholesterolSliderData.lowerBound,
        CardiacRisk.graphData.totalCholesterolSliderData.upperBound);
    updateThumbPosition(CardiacRisk.graphData.hdlSliderData.id,
        CardiacRisk.graphData.hdlSliderData.value,
        CardiacRisk.graphData.hdlSliderData.lowerBound,
        CardiacRisk.graphData.hdlSliderData.upperBound);
  }


/**
 * This method builds all the data required to display graphs for lab values.
 * Any updates to this model will reflect on the graphs being drawn on the UI.
 */
function buildRangeSliderDataModel() {
	var graphData = {};

	var totalCholesterolSliderData = {};
	totalCholesterolSliderData.id = 'totalCholesterolSlider';
	totalCholesterolSliderData.titleLeft = 'Total Cholesterol';
	totalCholesterolSliderData.titleRight = 'mg/dL';
	totalCholesterolSliderData.lowerBound = 140;
	totalCholesterolSliderData.upperBound= 401;
	totalCholesterolSliderData.barBoundsLowDisplay = 'Desirable';
	totalCholesterolSliderData.barBoundsHighDisplay = 'High';
	totalCholesterolSliderData.toolTipData = {
		'keys' : ['Desirable', 'Borderline High', 'High'],
		'values': ['140 - 199', '200 - 239', '240 - 401'],
		'styleClass': 'tooltipsterCardiacRiskTotalCholesterol'
	};
	graphData.totalCholesterolSliderData = totalCholesterolSliderData;

	var hdlSliderData = {};
	hdlSliderData.id = 'hdlGoodCholesterolSlider';
	hdlSliderData.titleLeft = 'HDL "Good" Cholesterol';
	hdlSliderData.titleRight = 'mg/dL';
	hdlSliderData.lowerBound = 30;
	hdlSliderData.upperBound = 150;
	hdlSliderData.barBoundsLowDisplay = 'Protective';
	hdlSliderData.barBoundsHighDisplay = 'High';
	if (CardiacRisk.patientInfo.gender === 'male') {
		hdlSliderData.toolTipData = {
			'keys' : ['High', 'Higher the Better', 'Low'],
			'values': ['60 - 150', '40 - 59', '30 - 39'],
			'styleClass': 'tooltipsterCardiacRiskHDL'
		};
	}
	else if (CardiacRisk.patientInfo.gender === 'female') {
		hdlSliderData.toolTipData = {
			'keys' : ['High', 'Higher the Better', 'Low'],
			'values': ['60 - 150', '50 - 59', '30 - 49'],
			'styleClass': 'tooltipsterCardiacRiskHDL'
		};
	}
	hdlSliderData.barHeight = 6;

	graphData.hdlSliderData = hdlSliderData;
	CardiacRisk.graphData = graphData;
}
/**
 * Generic method to create the range slider component.
 * @param data This is the data structure needed to build the component.
 *   Structure :
 *      id : The div id to be use to reference the component.
 *      titleLeft : Title text for the left header.
 *      titleRight : Title text for the right header.
 *      lowerBound : Lower bound value for the bar calculations.
 *      upperBound : Upper bound value for the bar calculations.
 *      barBoundsLowDisplay : Display text for the footer left bar bounds.
 *      barBoundsHighDisplay : Display text for the footer right bar bounds.
 *      toolTipData :
 *      {
            "keys" : Array of left column text.
                    Eg. ["Low", "Moderate", "High"]
            "values": Array of right column text.
                    Eg. ["0.03 - 0.9", "1 - 2.9", "3 - 20"]
            "styleClass": Styling class.
        }
 *      barHeight : Height to be used for the bar component of the graph.
 */
function generateRangeSlider(data) {
    var $sliderDiv = $('#' + data.id);
    $sliderDiv.append(
        '<header id=' + data.id + 'Header' + ' class="rangeSliderHeaderStyle">' +
            '<div>' +
                '<span id=' + data.id + 'TitleLeft' + ' class="headerLeftStyle">'+ data.titleLeft +'</span>' +
                '<span id=' + data.id + 'Image' + ' class="iconStyle fa fa-info-circle"></span>' +
        '   </div>' +
            '<span id=' + data.id + 'TitleRight' + '>'+ data.titleRight +'</span>' +
        '</header>' +
        '<div class="rangeSliderContentStyle">' +
            '<div id=' + data.id + 'Bar' + ' class="rangeSliderBarStyle"></div>' +
            '<div id=' + data.id + 'Thumb' + ' class="rangeSliderThumbStyle">'+ data.value +'</div>' +
            '<div id=' + data.id + 'ThumbDisplayText' + ' class="rangeSliderThumbDisplayTextStyle">' + data.thumbDisplayText + '</div>' +
        '</div>' +
        '<footer id=' + data.id + 'Footer' + ' class="rangeSliderFooterStyle">' +
            '<div class="footerLeftStyle">' +
                '<span id=' + data.id + 'FooterLeft' + '>'+ data.barBoundsLowDisplay +'</span>' +
            '</div>' +
            '<div class="footerRightStyle">' +
                '<span id=' + data.id + 'FooterRight' + '>'+ data.barBoundsHighDisplay +'</span>' +
            '</div>' +
        '</footer>'
    );
    updateBarHeight(data.id, data.barHeight);
    updateToolTips(data.id, data.toolTipData);
    updateThumbPosition(data.id, data.value, data.lowerBound, data.upperBound);
}

/**
 * Method to update the content of tool tip for the more information icon.
 * @param id Indicates the div id to be used to update the tooltip.
 * @param toolTipData
 */
function updateToolTips(id, toolTipData) {
    var contentString = '<table class="'+ toolTipData.styleClass + '">';
    var tableRows = '';

    for (step = 0; step < toolTipData.keys.length ;step++) {
        tableRows = tableRows.concat('<tr>');
        tableRows = tableRows.concat(
            '<td class="zeroMargin">'+ toolTipData.keys[step] +'</td>' +
            '<td> </td>' +
            '<td class="zeroMargin">' + toolTipData.values[step] + '</td>'
        );
        tableRows = tableRows.concat('</tr>');
    }
    contentString = contentString.concat(tableRows, '</table>');

    $('#' + id + 'Image').tooltipster({
        contentAsHTML : true,
        delay : 100,
        theme: 'tooltipster-CardiacRisk',
        content: $(contentString)
    });
}

/**
 * Method to update the bar height in the graph.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param barHeight : Indicates the height to use.
 */
function updateBarHeight(id, barHeight) {
    $('#' + id + 'Bar').css('height', '');
    $('#' + id + 'Bar').css('height', barHeight);
    if (barHeight < 12)
    {
        $('#' + id + 'Header').css('margin-bottom',2 * barHeight);
        $('#' + id + 'Thumb').addClass('barHeightThumbAdjustment');
        $('#' + id + 'ThumbDisplayText').addClass('barHeightThumbTextAdjustment');
        $('#' + id + 'Footer').addClass('barFooterAdjustment');
    }
}

/**
 * Method to change background color of the bar.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeBarBackgroundColor(id, color) {
    $('#' + id + 'Bar').css('background-color', '');
    $('#' + id + 'Bar').addClass(color);
}

/**
 * Method to change the thumb's background color
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeThumbBackgroundColor(id, color) {
    $('#' + id + 'Thumb').css('background-color', '');
    $('#' + id + 'Thumb').addClass(color);
}

/**
 * Method to change the thumb's text color
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeThumbTextColor(id, color) {
    if (color.length) {
        $('#' + id + 'Thumb').removeClass('rangeSliderThumbStyle').addClass(color);
    }
}

/**
 * Method to update the thumb's left position based on the data value.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param value : The value indicating the actual data value.
 * @param lowerBound : Value for the lower bound.
 * @param upperBound : Value for the upper bound.
 */
function updateThumbPosition(id, value, lowerBound, upperBound) {
    var thumbOffset = 0;
    if (value <= lowerBound) {
        thumbOffset = 0;
        changeThumbPositionToPosition(id, thumbOffset);
        changeThumbValueTextToPosition(id, thumbOffset);
        return;
    }

    var $barWidth = $('#' + id + 'Bar').width();
    var $thumb = $('#' + id + 'Thumb');
    var thumbWidthAdjustment = $thumb.width() +
        parseFloat($thumb.css('padding-left').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('padding-right').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderLeftWidth').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderRightWidth').replace(/[^-\d.]/g, ''));
    var valueToConsider = value;
    if (value > upperBound) {
        valueToConsider = upperBound;
    }
    var position = ((valueToConsider - lowerBound)/(upperBound - lowerBound)) * $barWidth;
    thumbOffset = position - thumbWidthAdjustment;
    if (thumbOffset < 0) {
        thumbOffset = 0;
    }
    changeThumbPositionToPosition(id, thumbOffset);
    changeThumbValueTextToPosition(id, thumbOffset);
}

/**
 * Method to change the thumb's value text position. This is calculated based on the thumb's position.
 * If this calculated position overlaps the left bounds text or right bounds text then the left or right bounds
 * labels are hidden.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param offset : Indicates the thumb's left offset.
 */
function changeThumbValueTextToPosition(id, offset) {

    var $thumb = $('#' + id + 'Thumb');
    var $barWidth = $('#' + id + 'Bar').width();
    var $thumbDisplayWidth = $('#' + id + 'ThumbDisplayText').width();
    var thumbWidth = $thumb.width() +
        parseFloat($thumb.css('padding-left').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('padding-right').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderLeftWidth').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderRightWidth').replace(/[^-\d.]/g, ''));
    var offsetForDisplay = offset + (thumbWidth / 2) - ($thumbDisplayWidth / 2);
    if (offsetForDisplay < 0) offsetForDisplay = 0;
    if (offsetForDisplay > ($barWidth - $thumbDisplayWidth)) offsetForDisplay = $barWidth - $thumbDisplayWidth;

    $('#' + id + 'ThumbDisplayText').css('left', '');
    $('#' + id + 'ThumbDisplayText').css('left', offsetForDisplay);

    if (offsetForDisplay >= 0 && offsetForDisplay <= $('#' + id + 'FooterLeft').width()) {
        $('#' + id + 'FooterLeft').css('visibility', 'hidden');
    }
    else {
        if ((offsetForDisplay + $thumbDisplayWidth) <= $barWidth && (offsetForDisplay + $thumbDisplayWidth) >= $barWidth - $('#' + id + 'FooterRight').width()) {
            $('#' + id + 'FooterRight').css('visibility', 'hidden');
        }
    }
}

/**
 * Method to change the thumb's position.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param offset : Indicates the value to position the thumb.
 */
function changeThumbPositionToPosition(id, offset) {
    $('#' + id + 'Thumb').css('left', '');
    $('#' + id + 'Thumb').css('left', offset);
}
