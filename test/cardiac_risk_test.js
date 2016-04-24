
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

  describe ('processLabsData', function () {
    it ('invokes functions to get lab values and sets the flag to false', function() {

      var loincCodes = function (loincCode) {};

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('getHSCRPValue').once().withExactArgs(loincCodes('30522-7')).returns(2.5);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('14647-2', '2093-3')).returns(240);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('2085-9')).returns(45);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('2089-1')).returns(161);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('13457-7')).returns(162);
      mockCardiacRisk.expects('getSystolicBloodPressureValue').once().withExactArgs(loincCodes('8480-6')).returns(111);


      CardiacRisk.processLabsData(loincCodes);

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(CardiacRisk.patientInfo.hsCReactiveProtein).to.equal(2.5);
      expect(CardiacRisk.patientInfo.totalCholesterol).to.equal(240);
      expect(CardiacRisk.patientInfo.hdl).to.equal(45);
      expect(CardiacRisk.patientInfo.ldl).to.equal(161);
      expect(CardiacRisk.patientInfo.ldlCalculated).to.equal(162);
      expect(CardiacRisk.patientInfo.systolicBloodPressure).to.equal(111);

      mockCardiacRisk.verify();
    });

    it ('invokes functions to get lab values and sets the flag to false when ldl is undefined', function() {

      var loincCodes = function (loincCode) {};

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('getHSCRPValue').once().withExactArgs(loincCodes('30522-7')).returns(2.5);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('14647-2', '2093-3')).returns(240);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('2085-9')).returns(45);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('2089-1')).returns(undefined);
      mockCardiacRisk.expects('getCholesterolValue').once().withExactArgs(loincCodes('13457-7')).returns(162);
      mockCardiacRisk.expects('getSystolicBloodPressureValue').once().withExactArgs(loincCodes('8480-6')).returns(111);


      CardiacRisk.processLabsData(loincCodes);

      expect(CardiacRisk.hasObservationWithUnsupportedUnits).to.equal(false);
      expect(CardiacRisk.patientInfo.hsCReactiveProtein).to.equal(2.5);
      expect(CardiacRisk.patientInfo.totalCholesterol).to.equal(240);
      expect(CardiacRisk.patientInfo.hdl).to.equal(45);
      expect(CardiacRisk.patientInfo.ldl).to.equal(162);
      expect(CardiacRisk.patientInfo.ldlCalculated).to.equal(162);
      expect(CardiacRisk.patientInfo.systolicBloodPressure).to.equal(111);

      mockCardiacRisk.verify();
    });
  });

  describe ('sortObservationsByAppliesTimeStamp', function () {
    it ('returns labs in sorted order based on time stamps', function () {
      var labsToSort = [
        {
          "valueQuantity" : {
            code: 'mm[Hg]',
            value: 119
          },
          "status" : 'amended',
          'appliesDateTime' : "2016-01-15T20:26:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T18:02:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mmol/L',
            value: 10
          },
          "status" : 'entered-in-error',
          'appliesDateTime' : "2016-03-07T14:20:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mg/L',
            value: 38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T17:14:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2015-12-16T19:54:00.000Z"
        }];

      var expectedResponse = [
        {
          "valueQuantity" : {
            code: 'mmol/L',
            value: 0.38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T18:02:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mg/L',
            value: 38
          },
          "status" : 'final',
          'appliesDateTime' : "2016-03-07T17:14:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mmol/L',
            value: 10
          },
          "status" : 'entered-in-error',
          'appliesDateTime' : "2016-03-07T14:20:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mm[Hg]',
            value: 119
          },
          "status" : 'amended',
          'appliesDateTime' : "2016-01-15T20:26:00.000Z"
        },
        {
          "valueQuantity" : {
            code: 'mmol/L',
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
              code: 'mg/dL',
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
            code: 'mmol/L',
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
            code: 'mmol/L',
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
            code: 'mol/L',
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

  describe ('getHSCRPValue', function() {
    describe ('returns given valid high sensitivity C-reactive protien input as per units', function() {
      it ('when the given value has units in mg/L', function() {
        var hscrp = [{
          "valueQuantity" : {
            code: 'mg/L',
            value: 3.8
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getHSCRPValue(hscrp)).to.equal(3.8);
      });

      it ('when the given value has units in mmol/L', function() {
        var hscrp = [{
          "valueQuantity" : {
            code: 'mmol/L',
            value: 0.38
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getHSCRPValue(hscrp)).to.equal(3.8);
      });

      it ('when the hscrp is in mmol/L when getFirstValidDataPointValueFromObservations is mocked', function() {
        var hscrp = [{
          "valueQuantity" : {
            code: 'mmol/L',
            value: 0.38
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects('getFirstValidDataPointValueFromObservations').once().withArgs(hscrp).returns(parseFloat(hscrp[0].valueQuantity.value)/0.10);
        var response = CardiacRisk.getHSCRPValue(hscrp);
        expect(response).to.equal(parseFloat(0.38) / 0.10);
        mock.verify();
      });
    });
    describe ('returns response as undefined for given invalid hsCRP input', function() {
      it ('when the given value has invalid units', function() {
        var hscrp = [{
          "valueQuantity" : {
            code: 'mol/L',
            value: 0.38
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        var response = CardiacRisk.getHSCRPValue(hscrp);
        expect(response).to.equal(undefined);
      });

      it ('when the given value is missing units field', function() {
        var hscrp = [{
          "valueQuantity" : {
            value: 0.38
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getHSCRPValue(hscrp)).to.equal(undefined);
      });

      it ('when the given value is an empty array', function() {
        var hscrp = [];

        expect(CardiacRisk.getHSCRPValue(hscrp)).to.equal(undefined);
      });
    });
  });

  describe ('getSystolicBloodPressureValue', function() {
    describe('returns given valid SBP in float value', function() {
      it('when SBP is a valid value in mm[Hg]', function(){
        var sbp = [{
          "valueQuantity" : {
            value: 106,
            code: 'mm[Hg]'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];
        expect(CardiacRisk.getSystolicBloodPressureValue(sbp)).to.equal(106.00);
      });

      it('when SBP is an invalid value in mm[Hg]', function(){
        var sbp = [{
          "valueQuantity" : {
            value: 106,
            code: 'mmsHg'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        expect(CardiacRisk.getSystolicBloodPressureValue(sbp)).to.equal(undefined);
      });

      it('when SBP is an invalid value in mm[Hg] when getFirstValidDataPointValueFromObservations is mocked', function(){
        var sbp = [{
          "valueQuantity" : {
            value: 106,
            code: 'mm[Hg]'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'
        }];

        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects('getFirstValidDataPointValueFromObservations').once().withArgs(sbp).returns(parseFloat(sbp[0].valueQuantity.value));
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
          code: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'Final'
      }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.code === 'mg/dL') {
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
          code: 'msg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      },
      {
        "valueQuantity" : {
          code: 'mm[Hg]',
          value: 119
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'amended'

      },
      {
        "valueQuantity" : {
          code: 'mfg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.code === 'mm[Hg]') {
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
          code: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'entered-in-error'

      },
        {
          "valueQuantity" : {
            code: 'mm[Hg]',
            value: 119
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'entered-in-error'

        },
        {
          "valueQuantity" : {
            code: 'mg/dL',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'entered-in-error'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint.valueQuantity.code === 'mm[Hg]') {
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
          code: 'mg/dL'
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'
      },
        {
          "valueQuantity" : {
            code: 'mm[Hg]'
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        },
        {
          "valueQuantity" : {
            code: 'mg/dL'
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
          code: 'mg/dL',
          value: 238
        },
        "appliesDateTime" : "2016-03-07T18:02:00.000Z",
        "status" : 'final'

      },
        {
          "valueQuantity" : {
            code: 'mmdHg',
            value: 119
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'amended'

        },
        {
          "valueQuantity" : {
            code: 'mfg/dL',
            value: 238
          },
          "appliesDateTime" : "2016-03-07T18:02:00.000Z",
          "status" : 'final'

        }];

      var mockCardiacRisk = sinonSandbox.mock(CardiacRisk);
      mockCardiacRisk.expects('sortObservationsByAppliesTimeStamp').once().withExactArgs(observations).returns(observations);

      var dataPointValue = CardiacRisk.getFirstValidDataPointValueFromObservations(observations,function (dataPoint) {
        if (dataPoint !== undefined) {
          if (dataPoint.valueQuantity.code === 'mg/dL') {
            return parseFloat(dataPoint.valueQuantity.value);
          }
          else if (dataPoint.valueQuantity.code === 'mmol/L') {
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

  describe ('computeRRS', function() {
    describe ('for men', function() {
      it ('with the score in bounds', function () {
        var malePatient = setPatientInfo('male',79,3.5,220,165,55,122,false,false);
        assert.equal(21, CardiacRisk.computeRRS(malePatient));
      });

      it ('with the score at the boundary of 100', function() {
        var malePatientBoundary = setPatientInfo('male',55,9,350,250,60,122,true,true);
        assert.equal(18, CardiacRisk.computeRRS(malePatientBoundary));
      });

      it ('calculates score when ldl is missing', function() {
        var malePatient = setPatientInfo('male',79,3.5,220,'undefined',55,122,false,false);
        assert.equal(21, CardiacRisk.computeRRS(malePatient));
      });
    });

    describe ('for women', function() {
      it ('with the score in bounds', function () {
        var malePatient = setPatientInfo('female',79,3.5,220,165,55,122,false,false);
        assert.equal(10, CardiacRisk.computeRRS(malePatient));
      });

      it ('with the score at the boundary of 100', function() {
        var malePatientBoundary = setPatientInfo('female',55,9,350,250,60,122,true,true);
        assert.equal(11, CardiacRisk.computeRRS(malePatientBoundary));
      });

      it ('calculates score when ldl is missing', function() {
        var malePatient = setPatientInfo('female',79,3.5,220,'undefined',55,122,false,false);
        assert.equal(10, CardiacRisk.computeRRS(malePatient));
      });
    });
  });

  describe ('computeWhatIfSBP', function() {
    it('it returns valid display text and value if systolic blood pressure is > 129', function(){
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 130;

      var expectedResponse = {};
      expectedResponse.value = '5%';
      expectedResponse.valueText = '120 mm/Hg';

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeRRS").returns(5);

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(expectedResponse.value);
      expect(functionResponse.valueText).to.equal(expectedResponse.valueText);
      mock.verify();
    });

    it('it returns valid display text and value if systolic blood pressure is = 120', function(){
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 120;

      var expectedResponse = {};
      expectedResponse.value = '6%';
      expectedResponse.valueText = '119 mm/Hg';

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeRRS").returns(6);

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(expectedResponse.value);
      expect(functionResponse.valueText).to.equal(expectedResponse.valueText);
      mock.verify();
    });

    it('it returns undefined if systolic blood pressure is = 105', function(){
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 105;

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.equal(undefined);
    });

    it('it returns undefined if systolic blood pressure is = 119', function(){
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.systolicBloodPressure = 119;

      var functionResponse = CardiacRisk.computeWhatIfSBP();

      expect(functionResponse).to.equal(undefined);
    });
  });

  describe ('computeWhatIfNotSmoker', function() {
    it('it returns valid score for if the patient is not a smoker', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = true;

      var patientInfoCopy = $.extend(true, {}, CardiacRisk.patientInfo);
      patientInfoCopy.relatedFactors.smoker = false;

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('computeRRS').once().withExactArgs(patientInfoCopy).returns(6);

      var functionResponse = CardiacRisk.computeWhatIfNotSmoker();

      expect(functionResponse).to.equal(6);

      mock.verify();
    });
  });

  describe ('computeWhatIfOptimal', function() {
    it('it returns valid score for all optimal values', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('computeRRS').once().withExactArgs(CardiacRisk.patientInfo).returns(6);

      var functionResponse = CardiacRisk.computeWhatIfOptimal();

      expect(functionResponse).to.equal(6);

      mock.verify();
    });
  });

  describe ('computePatientActions', function() {

    it('it returns dietHeader, diet, doctorHeader, doctor ' +
    ' display for cholesterol = 160 and ldl = 99 and hdl = 60 and CRP = 0.4', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 160;
      CardiacRisk.patientInfo.ldl = 99;
      CardiacRisk.patientInfo.hdl = 60;
      CardiacRisk.patientInfo.hsCReactiveProtein = 0.4;

      var functionResponse = CardiacRisk.computePatientActions();
      expect(functionResponse.dietHeader).to.be.equal('Continue to eat a healthy diet and exercise');
      expect(functionResponse.diet).to.be.equal('A healthy diet and regular exercise can keep cholesterol ' +
      'levels optimal.');
      expect(functionResponse.doctorHeader).to.be.equal('Talk to your doctor');
      expect(functionResponse.doctor).to.be.equal('Discuss the need to follow up with your primary care provider to monitor your health');
      expect(functionResponse.retesting).to.be.equal('Periodically retest your levels to continually monitor ' +
      'your health.');
    });

    it('it returns dietHeader, diet, doctorHeader, doctor and ' +
    'retesting display for cholesterol = 160 ldl = 130 and hdl = 60', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 160;
      CardiacRisk.patientInfo.ldl = 130;
      CardiacRisk.patientInfo.hdl = 60;
      CardiacRisk.patientInfo.hsCReactiveProtein = 0.5;

      var functionResponse = CardiacRisk.computePatientActions();
      expect(functionResponse.dietHeader).to.be.equal('Improve your diet and exercise more');
      expect(functionResponse.diet).to.be.equal('A better diet and regular exercise can drastically ' +
      'improve your cholesterol levels.');
      expect(functionResponse.doctorHeader).to.be.equal('Talk to your doctor');
      expect(functionResponse.doctor).to.be.equal('Discuss statins or other medications with your primary care ' +
      'provider that can help lower cholesterol.');
      expect(functionResponse.retesting).to.be.equal('Retesting in 1 to 2 weeks can help exclude temporary ' +
      'spikes in your blood levels.');
    });

    it('it returns dietHeader, diet, doctorHeader, doctor ' +
    ' display for cholesterol = 160 ldl = 130 and hdl = 60', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 160;
      CardiacRisk.patientInfo.ldl = 130;
      CardiacRisk.patientInfo.hdl = 60;
      CardiacRisk.patientInfo.hsCReactiveProtein = 0.4;

      var functionResponse = CardiacRisk.computePatientActions();
      expect(functionResponse.dietHeader).to.be.equal('Improve your diet and exercise more');
      expect(functionResponse.diet).to.be.equal('A better diet and regular exercise can drastically ' +
      'improve your cholesterol levels.');
      expect(functionResponse.doctorHeader).to.be.equal('Talk to your doctor');
      expect(functionResponse.doctor).to.be.equal('Discuss statins or other medications with your primary care ' +
      'provider that can help lower cholesterol.');
      expect(functionResponse.retesting).to.be.equal(undefined);
    });
  });

  describe ('validateLabsForMissingValueErrors', function(){
    it('returns errorText when hsCRP is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hsCReactiveProtein = undefined;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for High sensitivity C-Reactive Protein.');
    });

    it('returns errorText when hsCRP is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hsCReactiveProtein = '';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for High sensitivity C-Reactive Protein.');
    });

    it('returns errorText when hsCRP is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hsCReactiveProtein = 'asdf';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for High sensitivity C-Reactive Protein.');
    });

    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = undefined;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = '';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when totalcholesterol is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 'asdf';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for Total Cholesterol.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = undefined;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = '';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });

    it('returns errorText when hdl is undefined', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 'asdf';
      var functionResponse = CardiacRisk.patientInfo.validateLabsForMissingValueErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk cannot be calculated without a valid value for HDL.');
    });
  });

  describe ('validateLabsForOutOfBoundsValueErrors', function(){
    it('returns errorText when hsCRP is < 0.03', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hsCReactiveProtein = 0.02;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('C-Reactive Protein levels are too low to return a cardiac risk score.');
    });

    it('returns errorText when hsCRP is > 20', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hsCReactiveProtein = 21;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('C-Reactive Protein levels are too high to return a cardiac risk score.');
    });

    it('returns errorText when totalCholesterol is < 140', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 139;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('Total Cholesterol levels are too low to return a cardiac risk score.');
    });

    it('returns errorText when totalcholesterol is > 401', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.totalCholesterol = 402;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('Total Cholesterol levels are too high to return a cardiac risk score.');
    });

    it('returns errorText when hdl is < 30', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 29;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('HDL levels are too low to return a cardiac risk score.');
    });

    it('returns errorText when hdl is > 150', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.hdl = 151;
      var functionResponse = CardiacRisk.patientInfo.validateLabsForOutOfBoundsValueErrors();
      expect(functionResponse).to.be.equal('HDL levels are too high to return a cardiac risk score.');
    });
  });

  describe ('buildWhatIfOptimalValues', function() {
    it('returns a display text and value when the patient is a smoker and labs are not optimal', function() {
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
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
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = false;
      CardiacRisk.patientInfo.relatedFactors.familyHeartAttackHistory = true;

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
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
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
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.relatedFactors.smoker = false;
      CardiacRisk.patientInfo.relatedFactors.familyHeartAttackHistory = true;

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
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);

      var rrScore = 39;
      var response = {};
      response.value = rrScore + '%';

      var functionResponse = CardiacRisk.buildWhatIfNotSmoker(rrScore);
      expect(functionResponse).to.be.an('object');
      expect(functionResponse.value).to.equal(response.value);
    });
  });

  describe ('canCalculateCardiacRiskScore', function() {
    it ('returns true if the 3 values are available', function(){

      setPatientInfo('male',59,0.5,160,100,60,undefined,false,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateCardiacRiskScore();

      expect(response).to.be.equal(true);
      mock.verify();
    });

    it ('returns false if we have bad systolic blood pressure', function(){
      setPatientInfo('male',59,0.5,160,100,60,undefined,false,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(false);

      var response = CardiacRisk.canCalculateCardiacRiskScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined smoker status', function(){
      setPatientInfo('male',59,0.5,160,100,60,undefined,undefined,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateCardiacRiskScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });

    it ('returns false if we have undefined family history status', function(){
      setPatientInfo('male',59,0.5,160,100,60,undefined,true,undefined,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("isValidSysBP").once().returns(true);

      var response = CardiacRisk.canCalculateCardiacRiskScore();

      expect(response).to.be.equal(false);
      mock.verify();
    });
  });

  describe ('isLabsNotAvailable', function() {
    it ('returns true when one of the hsCRP is undefined', function() {
      setPatientInfo('male',65,undefined,232,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the totalCholesterol is undefined', function() {
      setPatientInfo('male',65,2.5,undefined,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the hdl is undefined', function() {
      setPatientInfo('male',65,2.5,345,452,undefined,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the ldl is undefined', function() {
      setPatientInfo('male',65,2.5,234,undefined,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the systolic blood pressure is undefined', function() {
      setPatientInfo('male',65,2.5,234,452,44,undefined,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns false when none of the labs are undefined', function() {
      setPatientInfo('male',65,2.5,234,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isLabsNotAvailable();
      expect(returnedValue).to.equal(false);
    });
  });

  describe ('isRequiredLabsNotAvailable', function() {
    it ('returns true when one of the hsCRP is undefined', function() {
      setPatientInfo('male',65,undefined,232,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the totalCholesterol is undefined', function() {
      setPatientInfo('male',65,2.5,undefined,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns true when one of the hdl is undefined', function() {
      setPatientInfo('male',65,2.5,345,452,undefined,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(true);
    });

    it ('returns false when none of the labs are undefined', function() {
      setPatientInfo('male',65,2.5,234,452,44,110,false,false,CardiacRisk.patientInfo);
      var returnedValue = CardiacRisk.isRequiredLabsNotAvailable();
      expect(returnedValue).to.equal(false);
    });
  });

  describe ('isValidSysBP', function(){
    it ('returns true if the systolic BP is not undefined and = 105', function(){
      var response = CardiacRisk.isValidSysBP(105);
      expect(response).to.be.equal(true);
    });

    it ('returns true if the systolic BP is not undefined and >= 105 and <=200', function(){
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

    it('it returns false for if the systolic blood pressure is < 105', function() {
      var functionResponse = CardiacRisk.isValidSysBP(104);
      expect(functionResponse).to.be.equal(false);
    });

    it('it returns false for if the systolic blood pressure is > 200', function() {
      var functionResponse = CardiacRisk.isValidSysBP(201);
      expect(functionResponse).to.be.equal(false);
    });
  });

  describe ('optimalLabs', function() {
    it('it returns true if the lab values are optimal with HSCRP >= 0.03', function() {
      setPatientInfo('male',59,0.03,160,100,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });
    it('it returns true if the lab values are optimal with HSCRP <= 0.9', function() {
      setPatientInfo('male',59,0.9,160,100,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns true if the lab values are optimal with totalCholesterol >= 140', function() {
      setPatientInfo('male',59,0.03,140,100,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });
    it('it returns true if the lab values are optimal with totalCholesterol <= 199', function() {
      setPatientInfo('male',59,0.9,199,100,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns true if the lab values are optimal with hdl >= 60', function() {
      setPatientInfo('male',59,0.03,160,100,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });
    it('it returns true if the lab values are optimal with hdl <= 150', function() {
      setPatientInfo('male',59,0.9,160,100,150,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns true if the lab values are optimal with ldl >= 50', function() {
      setPatientInfo('male',59,0.03,160,50,60,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });
    it('it returns true if the lab values are optimal with ldl <= 100', function() {
      setPatientInfo('male',59,0.9,160,100,150,119,false,false,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(true);
    });

    it('it returns false if the lab values are optimal', function() {
      setPatientInfo('male',59,3.5,150,130,40,106,undefined,undefined,CardiacRisk.patientInfo);
      var functionResponse = CardiacRisk.optimalLabs();
      expect(functionResponse).to.be.equal(false);
    });
  });

  describe ('validateModelForErrors', function(){
    it('returns errorText for incorrect age <45', function(){
      setPatientInfo('male',40,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('Cardiac risk can only be calculated for patients aged 45-80 years old.');
    });

    it('returns errorText for incorrect age >80', function(){
      setPatientInfo('male',85,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('Cardiac risk can only be calculated for patients aged 45-80 years old.');
    });

    it('returns errorText for invalid gender', function(){
      setPatientInfo('malee',59,0.5,160,100,60,119,false,false, CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('Cardiac Risk Score cannot be calculated for indeterminate gender.');
    });

    it('returns errorText for gender with Capital Letters', function(){

      setPatientInfo('MALE',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('');
    });

    it('returns errorText for missing lab values', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk.patientInfo);
      mock.expects('validateLabsForMissingValueErrors').once().returns('DummyLabErrorText');

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('DummyLabErrorText');
      mock.verify();
    });

    it('returns errorText for out of bound values', function(){
      setPatientInfo('male',59,0.5,160,100,60,119,false,false,CardiacRisk.patientInfo);

      var mock = sinonSandbox.mock(CardiacRisk.patientInfo);
      mock.expects('validateLabsForMissingValueErrors').once().returns('');
      mock.expects('validateLabsForOutOfBoundsValueErrors').once().returns('DummyOutOfBoundsErrorText');

      var functionResponse = CardiacRisk.validateModelForErrors();
      expect(functionResponse).to.be.equal('DummyOutOfBoundsErrorText');
      mock.verify();
    });
  });

});
