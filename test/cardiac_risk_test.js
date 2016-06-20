
describe ('CardiacRisk', function() {

  describe ('fetchDataAndPopulateCardiacRiskObject', function (){
    it ('sets the shouldProcessError flag', function () {
      expect(CardiacRisk.shouldProcessError).to.equal(false);

      CardiacRisk.fetchDataAndPopulateCardiacRiskObject();

      expect(CardiacRisk.shouldProcessError).to.equal(true);
    });

    it ('sets the shouldProcessError flag and checked if ready method gets invoked', function () {
      CardiacRisk.shouldProcessError = false;

      var mock = sinonSandbox.mock(FHIR.oauth2);
      mock.expects('ready').once();
      CardiacRisk.fetchDataAndPopulateCardiacRiskObject();

      expect(CardiacRisk.shouldProcessError).to.equal(true);
      mock.verify();
    });
  });

  describe ('computeAgeFromBirthDate', function () {
    it ('returns number of full years to this date', function() {
      var mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear() - 47);
      var retYears = CardiacRisk.computeAgeFromBirthDate(mockDate);
      expect(retYears).to.equal(47);
    });

    it ('returns number of years minus this past year', function() {
      var mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear() - 47);

      if (mockDate.getMonth() === 11) {
        mockDate.setFullYear(mockDate.getFullYear() + 1);
        mockDate.setMonth(0);
      } else {
        mockDate.setMonth(mockDate.getMonth() + 1);
      }
      var retYears = CardiacRisk.computeAgeFromBirthDate(mockDate);
      expect(retYears).to.equal(46);
    });
  });

  describe ('processLabsData', function () {
    it ('invokes functions to get lab values and sets the flag to false', function() {

      var loincCodes = function (loincCode) {};

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('14647-2', '2093-3')).returns(240);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('2085-9')).returns(45);
      mockCardiacRisk.expects('getSystolicBloodPressureValue').once().withExactArgs(loincCodes('8480-6')).returns(111);


      CardiacRisk.processLabsData(loincCodes);

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(CardiacRisk.patientInfo.totalCholesterol).to.equal(240);
      expect(CardiacRisk.patientInfo.hdl).to.equal(45);
      expect(CardiacRisk.patientInfo.systolicBloodPressure).to.equal(111);

      mockCardiacRisk.verify();
    });
  });

  describe ('sortObservationsByAppliesTimeStamp', function () {
    it ('returns labs in sorted order based on time stamps', function () {
      var labsToSort = [
        {
          "valueQuantity" : {
            unit: 'mm[Hg]',
            value: 119
          },
          "status" : 'amended',
          'appliesDateTime' : "2016-01-15T20:26:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T18:02:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 10
          },
          "status" : 'entered-in-error',
          'appliesDateTime' : "2016-03-07T14:20:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mg/L',
            value: 38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T17:14:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2015-12-16T19:54:00.000Z"
        }];

      var expectedResponse = [
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T18:02:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mg/L',
            value: 38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T17:14:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 10
          },
          "status" : 'entered-in-error',
          'appliesDateTime' : "2016-03-07T14:20:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mm[Hg]',
            value: 119
          },
          "status" : 'amended',
          'appliesDateTime' : "2016-01-15T20:26:00.000Z"
        },
        {
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2015-12-16T19:54:00.000Z"
        }];
      var response = CardiacRisk.sortObservationsByAppliesTimeStamp(labsToSort);

      expect(expectedResponse).to.deep.have.same.members(response);

      expect(expectedResponse[0]).to.deep.equal(response[0]);
      expect(expectedResponse[1]).to.deep.equal(response[1]);
      expect(expectedResponse[2]).to.deep.equal(response[2]);
      expect(expectedResponse[3]).to.deep.equal(response[3]);
      expect(expectedResponse[4]).to.deep.equal(response[4]);

    });
  });

  describe ('getCholesterolValue', function() {
    describe ('returns given cholesterol input with value as per units', function() {
      it ('when the cholesterol is in mg/dL', function() {
        var cholesterol = [{
            "valueQuantity" : {
              unit: 'mg/dL',
              value: 238
            },
            "appliesDateTime" : "2016-03-07T18:02:00.000Z",
            "status" : 'final'
        }];

        expect(CardiacRisk.getCholesterolValue(cholesterol)).to.equal(238.00);
      });

      it ('when the cholesterol is in mmol/L', function() {
        var cholesterol = [{
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'amended'
        }];

        expect(CardiacRisk.getCholesterolValue(cholesterol)).to.equal(parseFloat(238) / 0.026);
      });

      it ('when the cholesterol is in mmol/L when getFirstValidDataPointValueFromObservations is mocked', function() {
        var cholesterol = [{
          "valueQuantity" : {
            unit: 'mmol/L',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'amended'
        }];

        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects('getFirstValidDataPointValueFromObservations').once().withArgs(cholesterol).returns(parseFloat(cholesterol[0].valueQuantity.value)/0.026);
        var response = CardiacRisk.getCholesterolValue(cholesterol);
        expect(response).to.equal(parseFloat(238) / 0.026);
        mock.verify();
      });
    });
    describe ('returns response as undefined for given invalid cholesterol input', function() {
      it ('when the cholesterol has invalid units', function() {
        var cholesterol = [{
          "valueQuantity" : {
            unit: 'mol/L',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getCholesterolValue(cholesterol)).to.equal(undefined);
      });

      it ('when the cholesterol input is missing unit field', function() {
        var cholesterol = [{
          "valueQuantity" : {
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];
        expect(CardiacRisk.getCholesterolValue(cholesterol)).to.equal(undefined);
      });

      it ('when the cholesterol input is an empty array', function() {
        var cholesterol = [];
        expect(CardiacRisk.getCholesterolValue(cholesterol)).to.equal(undefined);
      });
    });
  });

  describe ('getSystolicBloodPressureValue', function() {
    describe('returns given valid SBP in float value', function() {
      it('when SBP is a valid value in mmHg', function(){
        var sbp = [{
          component : [{
            code : {
              coding : [{
                code : "8480-6",
                display : "Systolic Blood Pressure",
                system : "http://loinc.org"
              }],
              text : "Systolic Blood Pressure"
            },
            valueQuantity : {
              code : 'mm[Hg]',
              value : 106,
              unit : 'mmHg'
            }
          },
            {
              code : {
                coding : [{
                  code : "84830-6",
                  display : "Systolic Blood Pressure",
                  system : "http://loinc.org"
                }],
                text : "Systolic Blood Pressure"
              },
              valueQuantity : {
                code : 'mm[Hg]',
                value : 111,
                unit : 'mmHg'
              }
            }],
          effectiveDateTime : "2016-03-07T18:02:00.000Z",
          status : 'final'
        }];
        expect(CardiacRisk.getSystolicBloodPressureValue(sbp)).to.equal(106.00);
      });

      it('when SBP is an invalid value in mmHg', function(){
        var sbp = [{
          component : [{
            code : {
              coding : [{
                code : "8480-6",
                display : "Systolic Blood Pressure",
                system : "http://loinc.org"
              }],
              text : "Systolic Blood Pressure"
            },
            valueQuantity : {
              code : 'msm[Hg]',
              value : 106,
              unit : 'mmsHg'
            }
          }],
          "effectiveDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getSystolicBloodPressureValue(sbp)).to.equal(undefined);
      });

      it('when SBP is an invalid value in mmHg when getFirstValidDataPointValueFromObservations is mocked', function(){
        var sbp = [{
          component : [{
            code : {
              coding : [{
                code : "8480-6",
                display : "Systolic Blood Pressure",
                system : "http://loinc.org"
              }],
              text : "Systolic Blood Pressure"
            },
            valueQuantity : {
              code : 'mm[Hg]',
              value : 106,
              unit : 'mmsHg'
            }
          }],
          effectiveDateTime : "2016-03-07T18:02:00.000Z",
          status : 'final'
        }];

        var expectedSBP = [{
          component : [{
            code : {
              coding : [{
                code : "8480-6",
                display : "Systolic Blood Pressure",
                system : "http://loinc.org"
              }],
              text : "Systolic Blood Pressure"
            },
            valueQuantity : {
              code : 'mm[Hg]',
              value : 106,
              unit : 'mmsHg'
            }
          }],
          valueQuantity : {
            code : 'mm[Hg]',
            value : 106,
            unit : 'mmsHg'
          },
          effectiveDateTime : "2016-03-07T18:02:00.000Z",
          status : 'final'
        }];
        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects('getFirstValidDataPointValueFromObservations').once().withArgs(expectedSBP).returns(parseFloat(expectedSBP[0].valueQuantity.value));
        var response = CardiacRisk.getSystolicBloodPressureValue(sbp);
        expect(response).to.equal(106);
        mock.verify();

      });
    });
    describe('returns undefined for given invalid SBP input', function() {
      it('when SBP input is empty array', function(){
        var sbp = [];
        expect(CardiacRisk.getSystolicBloodPressureValue(sbp)).to.equal(undefined);
      });
    });
  });

  describe ('getFirstValidDataPointValueFromObservations', function() {
    it ('checks if sorting was invoked and supported units being blank',function (){
      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs([]).returns([]);

      CardiacRisk.getFirstValidDataPointValueFromObservations([],function () {});

      mockCardiacRisk.verify();
    });

    it ('checks if status is converted to lowercase.', function () {
      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          unit: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'Final'
      }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.unit === 'mg/dL') {
          return parseFloat(dataPoint.valueQuantity.value);
        }
        else
        {
          return undefined;
        }
      });

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPointValue).to.equal(parseFloat(observations[0].valueQuantity.value));
      mockCardiacRisk.verify();

    });

    it ('checks if sorting was invoked, has supported units and 1 valid observation',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          unit: 'msg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      },
      {
        "valueQuantity" : {
          unit: 'mm[Hg]',
          value: 119
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'amended'

      },
      {
        "valueQuantity" : {
          unit: 'mfg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.unit === 'mm[Hg]') {
          return parseFloat(dataPoint.valueQuantity.value);
        }
        else
        {
          return undefined;
        }
      });

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(true);
      expect(dataPointValue).to.equal(parseFloat(observations[1].valueQuantity.value));
      mockCardiacRisk.verify();
    });

    it ('checks if sorting function was invoked and status is in error',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          unit: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'entered-in-error'

      },
        {
          "valueQuantity" : {
            unit: 'mm[Hg]',
            value: 119
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'entered-in-error'

        },
        {
          "valueQuantity" : {
            unit: 'mg/dL',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'entered-in-error'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.unit === 'mm[Hg]') {
          return parseFloat(dataPoint.valueQuantity.value);
        }
        else
        {
          return undefined;
        }
      });

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPointValue).to.equal(undefined);
      mockCardiacRisk.verify();
    });

    it ('checks if sorting was invoked and valueQuantity missing',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'
      },
        {
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        },
        {
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPoint = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function () {});

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPoint).to.equal(undefined);
      mockCardiacRisk.verify();
    });

    it ('checks if sorting was invoked and value is missing',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          unit: 'mg/dL'
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'
      },
        {
          "valueQuantity" : {
            unit: 'mm[Hg]'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        },
        {
          "valueQuantity" : {
            unit: 'mg/dL'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPoint = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function () {});

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPoint).to.equal(undefined);
      mockCardiacRisk.verify();
    });

    it ('checks if sorting was invoked and units are missing',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      },
        {
          "valueQuantity" : {
            value: 119
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        },
        {
          "valueQuantity" : {
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPoint = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function () {});

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPoint).to.equal(undefined);
      mockCardiacRisk.verify();
    });

    it ('checks if sorting was invoked, has supported units and first valid observation',function (){

      CardiacRisk.hasObservationWithUnsupportedUnits = false;
      var observations = [{
        "valueQuantity" : {
          unit: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      },
        {
          "valueQuantity" : {
            unit: 'mmdHg',
            value: 119
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'amended'

        },
        {
          "valueQuantity" : {
            unit: 'mfg/dL',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint !== undefined) {
          if (dataPoint.valueQuantity.unit === 'mg/dL') {
            return parseFloat(dataPoint.valueQuantity.value);
          }
          else if (dataPoint.valueQuantity.unit === 'mmol/L') {
            return parseFloat(dataPoint.valueQuantity.value) / 0.026;
          }
          else {
            return undefined;
          }
        }
      });

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(dataPointValue).to.equal(observations[0].valueQuantity.value);
      mockCardiacRisk.verify();
    });
  });

  describe ('computeTenYearASCVD', function() {
    describe ('for men', function() {
      it ('who are white or not African American', function () {
        var malePatientWhite = setPatientInfo('male',46,150,40,140,true,true,'white',true,CardiacRisk.patientInfo);
        var malePatientOther = setPatientInfo('male',46,150,40,140,true,true,'other',true,CardiacRisk.patientInfo);
        assert.equal(12, CardiacRisk.computeTenYearASCVD(malePatientWhite));
        assert.equal(12, CardiacRisk.computeTenYearASCVD(malePatientOther));
      });

      it ('who are African American', function() {
        var malePatientAA = setPatientInfo('male',46,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(25, CardiacRisk.computeTenYearASCVD(malePatientAA));
      });
    });

    describe ('for women', function() {
      it ('who are white or not African American', function () {
        var femalePatientWhite = setPatientInfo('female',46,141,34,140,true,true,'white',true,CardiacRisk.patientInfo);
        var femalePatientOther = setPatientInfo('female',46,141,34,140,true,true,'other',true,CardiacRisk.patientInfo);
        assert.equal(10, CardiacRisk.computeTenYearASCVD(femalePatientWhite));
        assert.equal(10, CardiacRisk.computeTenYearASCVD(femalePatientOther));
      });

      it ('who are African American', function() {
        var femalePatientAA = setPatientInfo('female',46,141,34,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(27, CardiacRisk.computeTenYearASCVD(femalePatientAA));
      });
    });
  });

  describe ('computeLifetimeRisk', function() {
    describe ('for invalid patients', function() {
      it ('who are 19 yrs old or younger', function() {
        var malePatientAA = setPatientInfo('male',19,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(null, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });

      it ('who are 60 years old or older', function() {
        var malePatientAA = setPatientInfo('male',60,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(null, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });
    });

    describe ('for valid male patients', function() {
      it ('with the useOptimal flag set', function () {
        var malePatientAA = setPatientInfo('male',40,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(5, CardiacRisk.computeLifetimeRisk(malePatientAA, true));
      });

      it ('at higher-tiered major risk', function() {
        var malePatientAA = setPatientInfo('male',40,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(69, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });

      it ('at lower-tiered major risk', function() {
        var malePatientAA = setPatientInfo('male',40,150,40,140,false,true,'aa',false,CardiacRisk.patientInfo);
        assert.equal(50, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });

      it ('at elevated risk', function() {
        var malePatientAA = setPatientInfo('male',40,150,40,140,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(46, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });

      it ('at non-optimal risk', function() {
        var malePatientAA = setPatientInfo('male',40,150,40,120,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(36, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });

      it ('at all-optimal conditions', function() {
        var malePatientAA = setPatientInfo('male',40,150,40,110,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(5, CardiacRisk.computeLifetimeRisk(malePatientAA, false));
      });
    });

    describe ('for valid female patients', function() {
      it ('with the useOptimal flag set', function () {
        var femalePatientAA = setPatientInfo('female',40,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(8, CardiacRisk.computeLifetimeRisk(femalePatientAA, true));
      });

      it ('at higher-tiered major risk', function() {
        var femalePatientAA = setPatientInfo('female',40,150,40,140,true,true,'aa',true,CardiacRisk.patientInfo);
        assert.equal(50, CardiacRisk.computeLifetimeRisk(femalePatientAA, false));
      });

      it ('at lower-tiered major risk', function() {
        var femalePatientAA = setPatientInfo('female',40,150,40,140,false,true,'aa',false,CardiacRisk.patientInfo);
        assert.equal(39, CardiacRisk.computeLifetimeRisk(femalePatientAA, false));
      });

      it ('at elevated risk', function() {
        var femalePatientAA = setPatientInfo('female',40,150,40,140,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(39, CardiacRisk.computeLifetimeRisk(femalePatientAA, false));
      });

      it ('at non-optimal risk', function() {
        var femalePatientAA = setPatientInfo('female',40,150,40,120,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(27, CardiacRisk.computeLifetimeRisk(femalePatientAA, false));
      });

      it ('at all-optimal risk', function() {
        var femalePatientAA = setPatientInfo('female',40,150,40,110,false,false,'aa',false,CardiacRisk.patientInfo);
        assert.equal(8, CardiacRisk.computeLifetimeRisk(femalePatientAA, false));
      });
    });
  });

  describe ('computeWhatIfSBP', function() {
    it('it returns valid display text and value if systolic blood pressure is > 120', function(){
      setPatientInfo('male',59,150,40,106,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 130;

      var expectedResponse = {};
      expectedResponse.value = '12%';
      expectedResponse.valueText = '120 mm/Hg';

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(expectedResponse.value);
      expect(functionResponse.valueText).to.equal(expectedResponse.valueText);
    });

    it('it returns valid display text and value if systolic blood pressure is = 111', function(){
      setPatientInfo('male',59,150,40,106,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 111;

      var expectedResponse = {};
      expectedResponse.value = '10%';
      expectedResponse.valueText = '110 mm/Hg';

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(expectedResponse.value);
      expect(functionResponse.valueText).to.equal(expectedResponse.valueText);
    });

    it('it returns undefined if systolic blood pressure is = 90', function(){
      setPatientInfo('male',59,150,40,106,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 90;

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.equal(undefined);
    });

    it('it returns undefined if systolic blood pressure is = 110', function(){
      setPatientInfo('male',59,150,40,106,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 110;

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.equal(undefined);
    });
  });

  describe ('computeWhatIfNotSmoker', function() {
    it('it returns valid score for if the patient is not a smoker', function(){
      setPatientInfo('male',59,160,60,119,true,false,'white',false,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.computeWhatIfNotSmoker();

      expect(functionResponse).to.equal(5);
    });
  });

  describe ('computeWhatIfOptimal', function() {
    it('it returns valid score for all optimal values', function(){
      setPatientInfo('male',59,170,50,110,false,false,'white',false,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.computeWhatIfOptimal();

      expect(functionResponse).to.equal(5);

    });
  });

  describe ('computePatientActions', function() {

    it('it returns dietHeader, diet, doctorHeader, doctor ' +
    ' display for cholesterol = 160 and hdl = 60', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 160;
      CardiacRisk.patientInfo.hdl = 60;

      var functionResponse = CardiacRisk.computePatientActions();
      expect(functionResponse.dietHeader).to.be.equal('Continue to eat a healthy diet and exercise');
      expect(functionResponse.diet).to.be.equal('A healthy diet and regular exercise can keep cholesterol ' +
      'levels optimal.');
      expect(functionResponse.doctorHeader).to.be.equal('Talk to your doctor');
      expect(functionResponse.doctor).to.be.equal('Discuss the need to follow up with your primary care provider to monitor your health');
    });

    it('it returns dietHeader, diet, doctorHeader, and doctor ' +
    'display for cholesterol = 161 and hdl = 60', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 161;
      CardiacRisk.patientInfo.hdl = 60;

      var functionResponse = CardiacRisk.computePatientActions();
      expect(functionResponse.dietHeader).to.be.equal('Improve your diet and exercise more');
      expect(functionResponse.diet).to.be.equal('A better diet and regular exercise can drastically ' +
      'improve your cholesterol levels.');
      expect(functionResponse.doctorHeader).to.be.equal('Talk to your doctor');
      expect(functionResponse.doctor).to.be.equal('Discuss statins or other medications with your primary care ' +
      'provider that can help lower cholesterol.');
    });
  });

  describe ('validateLabsForMissingValueErrors', function(){
    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = undefined;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = '';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 'asdf';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = undefined;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,0.5,100,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = '';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 'asdf';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });
  });

  describe ('validateLabsForOutOfBoundsValueErrors', function(){
    it('returns errorText when totalCholesterol is < 130', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 129;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('Total Cholesterol levels are too low to return a cardiac risk score.');
    });

    it('returns errorText when totalCholesterol is > 320', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 402;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('Total Cholesterol levels are too high to return a cardiac risk score.');
    });

    it('returns errorText when hdl is < 20', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 19;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('HDL levels are too low to return a cardiac risk score.');
    });

    it('returns errorText when hdl is > 100', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 151;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('HDL levels are too high to return a cardiac risk score.');
    });
  });

  describe ('buildWhatIfOptimalValues', function() {
    it('returns a display text and value when the patient is a smoker and labs are not optimal', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = true;

      var rrScore = 39;
      var response = {};
      response.value = rrScore + '%';
      response.valueText = ' if you quit smoking and all levels were optimal';

      var optimalLabsStub = sinonSandbox.stub(CardiacRisk, 'optimalLabs');
      optimalLabsStub.returns(false);

      var functionResponse = CardiacRisk.buildWhatIfOptimalValues(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
      expect(functionResponse.valueText).to.equal(response.valueText);
    });

    it('returns a display text and no value when the patient is not a smoker, ' +
    'has optimal labs, family history is true and score is > 5', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = false;

      var rrScore = 39;
      var response = {};
      response.value = '';
      response.valueText = 'Your risk is the lowest it can be based on the supplied information';

      var optimalLabsStub = sinonSandbox.stub(CardiacRisk, 'optimalLabs');
      optimalLabsStub.returns(true);

      var functionResponse = CardiacRisk.buildWhatIfOptimalValues(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
      expect(functionResponse.valueText).to.equal(response.valueText);
    });

    it('returns a display text and no value when the patient is not a smoker, has optimal labs', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = false;

      var rrScore = 3;
      var response = {};
      response.value = '';
      response.valueText = 'All levels are currently optimal';

      var optimalLabsStub = sinonSandbox.stub(CardiacRisk, 'optimalLabs');
      optimalLabsStub.returns(true);

      var functionResponse = CardiacRisk.buildWhatIfOptimalValues(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
      expect(functionResponse.valueText).to.equal(response.valueText);
    });

    it('returns a display text and value when the patient is not a smoker, labs are not optimal', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = false;

      var rrScore = 39;
      var response = {};
      response.value = '39%';
      response.valueText = ' if all levels were optimal';

      var optimalLabsStub = sinonSandbox.stub(CardiacRisk, 'optimalLabs');
      optimalLabsStub.returns(false);

      var functionResponse = CardiacRisk.buildWhatIfOptimalValues(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
      expect(functionResponse.valueText).to.equal(response.valueText);
    });
  });

  describe ('buildWhatIfNotSmoker', function() {
    it('returns a value', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);

      var rrScore = 39;
      var response = {};
      response.value = rrScore + '%';

      var functionResponse = CardiacRisk.buildWhatIfNotSmoker(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
    });
  });

  describe ('canCalculateASCVDScore', function() {
    it ('returns true if the 5 values are available', function(){
      setPatientInfo('male',59,160,60,140,false,false,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(true);
      mock.verify();
    });

    it ('returns false if we have bad systolic blood pressure', function(){
      setPatientInfo('male',59,160,60,undefined,false,false,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(false);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined smoker status', function(){
      setPatientInfo('male',59,160,60,140,undefined,false,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined hypertension status', function(){
      setPatientInfo('male',59,160,60,140,false,undefined,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined race status', function(){
      setPatientInfo('male',59,160,60,140,false,false,undefined,true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined diabetes status', function(){
      setPatientInfo('male',59,160,60,140,false,false,'white',undefined,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined hypertensive status', function(){
      setPatientInfo('male',59,160,60,140,false,undefined,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined race status', function(){
      setPatientInfo('male',59,160,60,140,false,false,undefined,true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined diabetes status', function(){
      setPatientInfo('male',59,160,60,140,false,false,'white',undefined,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateASCVDScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });
  });

  describe ('isLabsNotAvailable', function() {
    it ('returns true when one of the totalCholesterol is undefined', function() {
      setPatientInfo('male',65,undefined,44,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the hdl is undefined', function() {
      setPatientInfo('male',65,345,undefined,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the systolic blood pressure is undefined', function() {
      setPatientInfo('male',65,234,44,undefined,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns false when none of the labs are undefined', function() {
      setPatientInfo('male',65,234,44,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(false);
    });
  });

  describe ('isRequiredLabsNotAvailable', function() {
    it ('returns true when one of the totalCholesterol is undefined', function() {
      setPatientInfo('male',65,undefined,44,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the hdl is undefined', function() {
      setPatientInfo('male',65,345,undefined,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns false when none of the labs are undefined', function() {
      setPatientInfo('male',65,234,44,110,false,false,'white',true,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(false);
    });
  });

  describe ('isValidSysBP', function(){
    it ('returns true if the systolic BP is not undefined and = 90', function(){
      var response = CardiacRisk.isValidSysBP(90);
      expect(response).to.be.equal(true);
    });

    it ('returns true if the systolic BP is not undefined and >= 90 and <= 200', function(){
      var response = CardiacRisk.isValidSysBP(110);
      expect(response).to.be.equal(true);
    });

    it ('returns true if the systolic BP is not undefined and = 200', function(){
      var response = CardiacRisk.isValidSysBP(200);
      expect(response).to.be.equal(true);
    });

    it ('returns false if the systolic BP is undefined', function(){
      var response = CardiacRisk.isValidSysBP(undefined);
      expect(response).to.be.equal(false);
    });

    it('it returns false for if the systolic blood pressure is NaN', function() {
      var functionResponse = CardiacRisk.isValidSysBP('NaN');
      expect(functionResponse).to.be.equal(false);
    });

    it('it returns false for if the systolic blood pressure is < 90', function() {
      var functionResponse = CardiacRisk.isValidSysBP(89);
      expect(functionResponse).to.be.equal(false);
    });

    it('it returns false for if the systolic blood pressure is > 200', function() {
      var functionResponse = CardiacRisk.isValidSysBP(201);
      expect(functionResponse).to.be.equal(false);
    });
  });

  describe ('optimalLabs', function() {
    it('it returns true if the lab values are optimal with totalCholesterol >= 140', function() {
      setPatientInfo('male',59,140,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });
    it('it returns true if the lab values are optimal with totalCholesterol <= 199', function() {
      setPatientInfo('male',59,199,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns true if the lab values are optimal with hdl >= 60', function() {
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns true if the lab values are optimal with hdl <= 150', function() {
      setPatientInfo('male',59,160,150,119,false,false,'white',true,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns false if the lab values are optimal', function() {
      setPatientInfo('male',59,150,40,106,undefined,false,'white',true,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(false);
    });
  });

  describe ('validateModelForErrors', function(){
    it('returns errorText for incorrect age <20', function(){
      setPatientInfo('male',19,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('ASCVD risk can only be estimated for patients aged 20-79 years old.');
    });

    it('returns errorText for incorrect age >79', function(){
      setPatientInfo('male',85,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('ASCVD risk can only be estimated for patients aged 20-79 years old.');
    });

    it('returns errorText for invalid gender', function(){
      setPatientInfo('malee',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('ASCVD risk cannot be estimated for indeterminate gender.');
    });

    it('returns errorText for gender with Capital Letters', function(){
      setPatientInfo('MALE',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('');
    });

    it('returns errorText for missing lab values', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk.patientInfo);
      mock.expects('validateLabsForMissingValueErrors').once().returns('DummyLabErrorText');

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('DummyLabErrorText');
      mock.verify();
    });

    it('returns errorText for out of bound values', function(){
      setPatientInfo('male',59,160,60,119,false,false,'white',true,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk.patientInfo);
      mock.expects('validateLabsForMissingValueErrors').once().returns('');
      mock.expects('validateLabsForOutOfBoundsValueErrors').once().returns('DummyOutOfBoundsErrorText');

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('DummyOutOfBoundsErrorText');
      mock.verify();
    });
  });

});
