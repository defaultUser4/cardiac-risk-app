
describe ('CardiacRiskController', function() {

  describe ('updatePatientDemographicsBanner', function() {
    it ('sets the UI elements with correct values when male', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,undefined,false,false,'white',true, CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.dateOfBirth = new Date(2016,5,22);

      var patientName = document.createElement('span');
      patientName.id = 'patientName';
      patientName.innerHTML = 'Blank';
      document.body.appendChild(patientName);

      var patientAge = document.createElement('span');
      patientAge.id = 'patientAge';
      patientAge.innerHTML = 'Blank';
      document.body.appendChild(patientAge);

      var patientGender = document.createElement('span');
      patientGender.id = 'patientGender';
      patientGender.innerHTML = 'Blank';
      document.body.appendChild(patientGender);

      var patientDOB = document.createElement('span');
      patientDOB.id = 'patientDOB';
      patientDOB.innerHTML = 'Blank';
      document.body.appendChild(patientDOB);

      updatePatientDemographicsBanner();

      var updatedPatientName = document.getElementById('patientName');
      var updatedPatientAge = document.getElementById('patientAge');
      var updatedPatientGender = document.getElementById('patientGender');
      var updatedPatientDOB = document.getElementById('patientDOB');

      expect(updatedPatientName.innerHTML).to.equal('John Doe');
      expect(updatedPatientAge.innerHTML).to.equal('59yrs');
      expect(updatedPatientGender.innerHTML).to.equal('M');
      expect(updatedPatientDOB.innerHTML).to.equal('6/22/2016');

    });

    it ('sets the UI elements with correct values when female', function() {
      CardiacRisk.patientInfo = setPatientInfo('female',59,160,60,undefined,false,false,'white',true, CardiacRisk.patientInfo);
      CardiacRisk.patientInfo.dateOfBirth = new Date(2016,5,22);

      var patientName = document.createElement('span');
      patientName.id = 'patientName';
      patientName.innerHTML = 'Blank';
      document.body.appendChild(patientName);

      var patientAge = document.createElement('span');
      patientAge.id = 'patientAge';
      patientAge.innerHTML = 'Blank';
      document.body.appendChild(patientAge);

      var patientGender = document.createElement('span');
      patientGender.id = 'patientGender';
      patientGender.innerHTML = 'Blank';
      document.body.appendChild(patientGender);

      var patientDOB = document.createElement('span');
      patientDOB.id = 'patientDOB';
      patientDOB.innerHTML = 'Blank';
      document.body.appendChild(patientDOB);

      updatePatientDemographicsBanner();

      var updatedPatientName = document.getElementById('patientName');
      var updatedPatientAge = document.getElementById('patientAge');
      var updatedPatientGender = document.getElementById('patientGender');
      var updatedPatientDOB = document.getElementById('patientDOB');

      expect(updatedPatientName.innerHTML).to.equal('John Doe');
      expect(updatedPatientAge.innerHTML).to.equal('59yrs');
      expect(updatedPatientGender.innerHTML).to.equal('F');
      expect(updatedPatientDOB.innerHTML).to.equal('6/22/2016');

    });
  });

  describe ('updatePatientActions', function() {
    it ('sets up the patient data correctly', function () {

      var patientActions = {};
      patientActions.dietHeader = "diet header";
      patientActions.diet = "diet";
      patientActions.doctorHeader = "doctorHeader";
      patientActions.doctor = "doctor";
      patientActions.retesting = "retesting";

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computePatientActions").returns(patientActions);

      updatePatientActions();

      mock.verify();
    });

    it('should set text for ui elements', function(){

      var contentDietExerciseHeader = document.createElement('header');
      contentDietExerciseHeader.id = 'contentDietExerciseHeader';
      contentDietExerciseHeader.innerHTML = 'Blank';
      document.body.appendChild(contentDietExerciseHeader);

      var contentDietExercise = document.createElement('p');
      contentDietExercise.id = 'contentDietExercise';
      contentDietExercise.innerHTML = 'Blank';
      document.body.appendChild(contentDietExercise);

      var contentDoctorHeader = document.createElement('header');
      contentDoctorHeader.id = 'contentDoctorHeader';
      contentDoctorHeader.innerHTML = 'Blank';
      document.body.appendChild(contentDoctorHeader);

      var contentDoctor = document.createElement('p');
      contentDoctor.id = 'contentDoctor';
      contentDoctor.innerHTML = 'Blank';
      document.body.appendChild(contentDoctor);

      var contentRetesting = document.createElement('p');
      contentRetesting.id = 'contentRetesting';
      contentRetesting.innerHTML = 'Blank';
      document.body.appendChild(contentRetesting);

      expect(contentDietExerciseHeader.innerHTML).to.equal('Blank');
      expect(contentDietExercise.innerHTML).to.equal('Blank');
      expect(contentDoctorHeader.innerHTML).to.equal('Blank');
      expect(contentDoctor.innerHTML).to.equal('Blank');
      expect(contentRetesting.innerHTML).to.equal('Blank');

      var patientActions = {};
      patientActions.dietHeader = "diet header";
      patientActions.diet = "diet";
      patientActions.doctorHeader = "doctorHeader";
      patientActions.doctor = "doctor";
      patientActions.retesting = "retesting";

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computePatientActions").returns(patientActions);

      updatePatientActions();

      var updatedContentDietExerciseHeader = document.getElementById('contentDietExerciseHeader');
      var updatedContentDietExercise = document.getElementById('contentDietExercise');
      var updatedContentDoctorHeader = document.getElementById('contentDoctorHeader');
      var updatedContentDoctor = document.getElementById('contentDoctor');
      var updatedContentRetesting = document.getElementById('contentRetesting');

      expect(updatedContentDietExerciseHeader.innerHTML).to.equal('diet header');
      expect(updatedContentDietExercise.innerHTML).to.equal('diet');
      expect(updatedContentDoctorHeader.innerHTML).to.equal('doctorHeader');
      expect(updatedContentDoctor.innerHTML).to.equal('doctor');
      expect(updatedContentRetesting.innerHTML).to.equal('retesting');

      mock.verify();

    });
  });

  describe('checkForIncompleteState', function(){
    it('sets UI elements for incomplete state with sbp', function(){
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,130,undefined,'white',true, CardiacRisk.patientInfo);

      var resultsInfo = document.createElement('div');
      resultsInfo.id = 'resultsInfo';
      resultsInfo.className = 'contentHidden';
      document.body.appendChild(resultsInfo);

      var resultsSliders = document.createElement('div');
      resultsSliders.id = 'resultsSliders';
      resultsSliders.className = 'contentHidden';
      document.body.appendChild(resultsSliders);

      var riskBar = document.createElement('div');
      riskBar.id = 'riskBar';
      riskBar.className = 'contentHidden';
      document.body.appendChild(riskBar);

      var riskMessage = document.createElement('span');
      riskMessage.id = 'riskMessage';
      riskMessage.innerHTML = 'Blank';
      document.body.appendChild(riskMessage);

      var riskDescriptionText = document.createElement('span');
      riskDescriptionText.id = 'riskDescriptionText';
      riskDescriptionText.innerHTML = 'Blank';
      document.body.appendChild(riskDescriptionText);

      var riskDescriptionValue = document.createElement('span');
      riskDescriptionValue.id = 'riskDescriptionValue';
      riskDescriptionValue.innerHTML = 'Blank';
      document.body.appendChild(riskDescriptionValue);

      var containerPatientActions = document.createElement('div');
      containerPatientActions.id = 'containerPatientActions';
      containerPatientActions.className = 'abc';
      document.body.appendChild(containerPatientActions);

      var whatIfContainer = document.createElement('div');
      whatIfContainer.id = 'whatIfContainer';
      whatIfContainer.className = 'abc';
      document.body.appendChild(whatIfContainer);

      var horizontalRule = document.createElement('hr');
      horizontalRule.id = 'horizontalRule';
      horizontalRule.className = 'abc';
      document.body.appendChild(horizontalRule);

      var sbpInput = document.createElement('INPUT');
      sbpInput.id = 'sbpInput';
      sbpInput.setAttribute('type', 'text');
      document.body.appendChild(sbpInput);

      checkForIncompleteState();

      var updatedResultsInfo = document.getElementById('resultsInfo');
      expect(updatedResultsInfo.className).to.be.equal('');
      var updatedResultsSliders = document.getElementById('resultsSliders');
      expect(updatedResultsSliders.className).to.be.equal('');
      var updatedRiskBar = document.getElementById('riskBar');
      expect(updatedRiskBar.className).to.be.equal('riskBarIncomplete');
      var updatedRiskMessage = document.getElementById('riskMessage');
      expect(updatedRiskMessage.innerHTML).to.be.equal('Incomplete');
      var updatedRiskDescriptionText = document.getElementById('riskDescriptionText');
      expect(updatedRiskDescriptionText.innerHTML).to.be.equal('Related factors must be completed in order to calculate your cardiac risk score.');
      var updatedRiskDescriptionValue = document.getElementById('riskDescriptionValue');
      expect(updatedRiskDescriptionValue.innerHTML).to.be.equal('');

      var udpatedContainerPatientActions = document.getElementById('containerPatientActions');
      expect(udpatedContainerPatientActions.className).to.be.equal('contentHiddenVisibility');
      var updatedWhatIfContainer = document.getElementById('whatIfContainer');
      expect(updatedWhatIfContainer.className).to.be.equal('contentHidden');
      var updatedHorizontalRule = document.getElementById('horizontalRule');
      expect(updatedHorizontalRule.className).to.be.equal('contentHidden');

    });

    it('sets UI elements for invalid sbp', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,undefined,false,false,'white',true, CardiacRisk.patientInfo);

      var sbpInput = document.createElement('INPUT');
      sbpInput.id = 'sbpInput';
      sbpInput.setAttribute('type', 'text');
      document.body.appendChild(sbpInput);

      checkForIncompleteState();

      var updatedSbpInput = document.getElementById('sbpInput');
      expect(updatedSbpInput.value).to.be.equal('');
    });
  });

  describe('validData',function(){
    it('updates UI elements with error text', function(){


      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('validateModelForErrors').once().returns('This is the error text');
      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('processError').once().withExactArgs('This is the error text');

      var response = validData();

      expect(response).to.be.equal(false);
      mock.verify();
      mockWindow.verify();

    });

    it('returns true if error text is not available', function(){
      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('validateModelForErrors').once().returns('');

      var response = validData();

      expect(response).to.be.equal(true);
      mock.verify();
    });

  });

  describe('processError',function(){
    it('updates UI elements for the given errorText with shouldProcessError is true', function(){
      var pageLoading = document.createElement('div');
      pageLoading.id = 'pageLoading';
      pageLoading.className = 'abc';
      document.body.appendChild(pageLoading);

      var pageError = document.createElement('div');
      pageError.id = 'pageError';
      pageError.className = 'abc';
      document.body.appendChild(pageError);

      var pageContent = document.createElement('div');
      pageContent.id = 'pageContent';
      pageContent.className = 'abc';
      document.body.appendChild(pageContent);

      var pageErrorLabel = document.createElement('label');
      pageErrorLabel.id = 'pageErrorLabel';
      pageErrorLabel.innerHTML = 'abc';
      document.body.appendChild(pageErrorLabel);

      CardiacRisk.shouldProcessError = true;

      processError('This is the error text');

      var updatedPageLoading = document.getElementById('pageLoading');
      expect(updatedPageLoading.className).to.be.equal('contentHidden');
      var updatedPageError = document.getElementById('pageError');
      expect(updatedPageError.className).to.be.equal('contentErrorLayout');
      var updatedPageContent = document.getElementById('pageContent');
      expect(updatedPageContent.className).to.be.equal('contentHidden');
      var updatedPageErrorLabel = document.getElementById('pageErrorLabel');
      expect(updatedPageErrorLabel.innerHTML).to.be.equal('This is the error text');

      document.body.removeChild(updatedPageLoading);
      document.body.removeChild(updatedPageError);
      document.body.removeChild(updatedPageContent);
      document.body.removeChild(updatedPageErrorLabel);

      expect(CardiacRisk.shouldProcessError).to.be.equal(false);

    });

    it('updates UI elements for the given errorText with shouldProcessError is false', function(){
      var pageLoading = document.createElement('div');
      pageLoading.id = 'pageLoading';
      pageLoading.className = 'abc';
      document.body.appendChild(pageLoading);

      var pageError = document.createElement('div');
      pageError.id = 'pageError';
      pageError.className = 'abc';
      document.body.appendChild(pageError);

      var pageContent = document.createElement('div');
      pageContent.id = 'pageContent';
      pageContent.className = 'abc';
      document.body.appendChild(pageContent);

      var pageErrorLabel = document.createElement('label');
      pageErrorLabel.id = 'pageErrorLabel';
      pageErrorLabel.innerHTML = 'abc';
      document.body.appendChild(pageErrorLabel);

      CardiacRisk.shouldProcessError = false;

      processError('This is the error text');

      var updatedPageLoading = document.getElementById('pageLoading');
      expect(updatedPageLoading.className).to.be.equal('abc');
      var updatedPageError = document.getElementById('pageError');
      expect(updatedPageError.className).to.be.equal('abc');
      var updatedPageContent = document.getElementById('pageContent');
      expect(updatedPageContent.className).to.be.equal('abc');
      var updatedPageErrorLabel = document.getElementById('pageErrorLabel');
      expect(updatedPageErrorLabel.innerHTML).to.be.equal('abc');

      expect(CardiacRisk.shouldProcessError).to.be.equal(false);

    });

  });

  describe('updateUI', function(){
    it('updates UI elements and invokes other functions', function(){

      var containerPatientActions = document.createElement('div');
      containerPatientActions.id = 'containerPatientActions';
      containerPatientActions.className = 'abc';
      document.body.appendChild(containerPatientActions);

      var whatIfContainer = document.createElement('div');
      whatIfContainer.id = 'whatIfContainer';
      whatIfContainer.className = 'abc';
      document.body.appendChild(whatIfContainer);

      var horizontalRule = document.createElement('hr');
      horizontalRule.id = 'horizontalRule';
      horizontalRule.className = 'abc';
      document.body.appendChild(horizontalRule);

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('updateUICardiacRiskScore').once();
      mockWindow.expects('updateUIWhatIfSystolicBloodPressure').once();
      mockWindow.expects('updateUIWhatIfNotSmoker').once();
      mockWindow.expects('updateUIWhatIfOptimalValues').once();
      mockWindow.expects('updateASCVDRiskEstimates').once();
      mockWindow.expects('adjustRelatedFactorsSize').once();

      updateUI();

      var udpatedContainerPatientActions = document.getElementById('containerPatientActions');
      expect(udpatedContainerPatientActions.className).to.be.equal('patientActions');
      var updatedWhatIfContainer = document.getElementById('whatIfContainer');
      expect(updatedWhatIfContainer.className).to.be.equal('whatIfContainerLayout');
      var updatedHorizontalRule = document.getElementById('horizontalRule');
      expect(updatedHorizontalRule.className).to.be.equal('hrStyle');

      mockWindow.verify();
    });
  });

  describe('onSBPInput', function(){
    it('updates value for systolic blood pressure on the UI', function(){
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);

      var sbpInput = document.createElement('INPUT');
      sbpInput.id = 'sbpInput';
      sbpInput.setAttribute('type', 'text');
      sbpInput.value = '444';
      document.body.appendChild(sbpInput);

      expect(sbpInput.value).to.be.equal('444');
      expect(CardiacRisk.patientInfo.systolicBloodPressure).to.be.a('number');

      onSBPInput();

      var updatedSbpInput = document.getElementById('sbpInput');
      expect(updatedSbpInput.value).to.be.equal('119');
      expect(CardiacRisk.patientInfo.systolicBloodPressure).to.be.a('number');
    });

    it('updates value for systolic blood pressure on the UI when SysBP is undefined', function(){
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,undefined,false,false,'white',true, CardiacRisk.patientInfo);

      var sbpInput = document.createElement('INPUT');
      sbpInput.id = 'sbpInput';
      sbpInput.setAttribute('type', 'text');
      document.body.appendChild(sbpInput);

      var legendSysBPError = document.createElement('div');
      legendSysBPError.id = 'legendSysBPError';
      legendSysBPError.className = 'abc';
      document.body.appendChild(legendSysBPError);

      var asteriskSBP = document.createElement('span');
      asteriskSBP.id = 'asteriskSBP';
      asteriskSBP.className = 'abc';
      document.body.appendChild(asteriskSBP);

      expect(sbpInput.value).to.be.equal('');

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('isValidSysBP').once().returns(false);

      onSBPInput();

      var updatedLegendSysBPError = document.getElementById('legendSysBPError');
      expect(updatedLegendSysBPError.className).to.be.equal('relatedFactorsErrors');
      var updatedAsteriskSBP = document.getElementById('asteriskSBP');
      expect(updatedAsteriskSBP.className).to.be.equal('asterisk');
      mock.verify();
    });

    it('updates value for systolic blood pressure on the UI when SysBP is valid', function(){
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);

      var sbpInput = document.createElement('INPUT');
      sbpInput.id = 'sbpInput';
      sbpInput.setAttribute('type', 'text');
      document.body.appendChild(sbpInput);

      var legendSysBPError = document.createElement('div');
      legendSysBPError.id = 'legendSysBPError';
      legendSysBPError.className = 'abc';
      document.body.appendChild(legendSysBPError);

      var asteriskSBP = document.createElement('span');
      asteriskSBP.id = 'asteriskSBP';
      asteriskSBP.className = 'abc';
      document.body.appendChild(asteriskSBP);

      expect(sbpInput.value).to.be.equal('');

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects('isValidSysBP').once().withExactArgs(119).returns(true);
      mock.expects('canCalculateASCVDScore').once().returns(true);

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('updateUI').once();

      onSBPInput();

      var updatedLegendSysBPError = document.getElementById('legendSysBPError');
      expect(updatedLegendSysBPError.className).to.be.equal('relatedFactorsErrorsHidden');
      var updatedAsteriskSBP = document.getElementById('asteriskSBP');
      expect(updatedAsteriskSBP.className).to.be.equal('contentHidden');
      mock.verify();
      mockWindow.verify();
    });
  });

  describe ('updateUICardiacRiskScore', function() {
    beforeEach(function () {

      var riskBar = document.createElement('div');
      riskBar.id = 'riskBar';
      riskBar.className = 'abc';
      document.body.appendChild(riskBar);

      var riskMessage = document.createElement('span');
      riskMessage.id = 'riskMessage';
      riskMessage.innerHTML = 'abc';
      document.body.appendChild(riskMessage);

      var riskDescriptionText = document.createElement('span');
      riskDescriptionText.id = 'riskDescriptionText';
      riskDescriptionText.innerHTML = 'abc';
      document.body.appendChild(riskDescriptionText);

      var riskDescriptionValue = document.createElement('span');
      riskDescriptionValue.id = 'riskDescriptionValue';
      riskDescriptionValue.innerHTML = 'abc';
      document.body.appendChild(riskDescriptionValue);

    });

    it ('updates correctly for score of low risk and UI updates', function() {

      CardiacRisk.patientInfo = {};

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeTenYearASCVD").returns(4);

      updateUICardiacRiskScore();

      var updatedRiskBar = document.getElementById('riskBar');
      expect(updatedRiskBar.className).to.be.equal('riskBarLowRisk');
      var updatedRiskMessage = document.getElementById('riskMessage');
      expect(updatedRiskMessage.innerHTML).to.be.equal('Low Risk');
      var updatedRiskDescriptionText = document.getElementById('riskDescriptionText');
      expect(updatedRiskDescriptionText.innerHTML).to.be.equal('Your chance of having a heart attack, stroke, or other ' +
      'heart disease event at some point in the next 10 years is ');
      var updatedRiskDescriptionValue = document.getElementById('riskDescriptionValue');
      expect(updatedRiskDescriptionValue.innerHTML).to.be.equal('4%');

      mock.verify();
    });

    it ('updates correctly for score of low to moderate risk and UI updates', function() {

      CardiacRisk.patientInfo = {};

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeTenYearASCVD").returns(5);

      updateUICardiacRiskScore();

      var updatedRiskBar = document.getElementById('riskBar');
      expect(updatedRiskBar.className).to.be.equal('riskBarLowModerateRisk');
      var updatedRiskMessage = document.getElementById('riskMessage');
      expect(updatedRiskMessage.innerHTML).to.be.equal('Low-Moderate Risk');
      var updatedRiskDescriptionText = document.getElementById('riskDescriptionText');
      expect(updatedRiskDescriptionText.innerHTML).to.be.equal('Your chance of having a heart attack, stroke, or other ' +
      'heart disease event at some point in the next 10 years is ');
      var updatedRiskDescriptionValue = document.getElementById('riskDescriptionValue');
      expect(updatedRiskDescriptionValue.innerHTML).to.be.equal('5%');

      mock.verify();
    });

    it ('updates correctly for score of moderate risk and UI updates', function() {

      CardiacRisk.patientInfo = {};

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeTenYearASCVD").returns(10);

      updateUICardiacRiskScore();

      var updatedRiskBar = document.getElementById('riskBar');
      expect(updatedRiskBar.className).to.be.equal('riskBarModerateRisk');
      var updatedRiskMessage = document.getElementById('riskMessage');
      expect(updatedRiskMessage.innerHTML).to.be.equal('Moderate Risk');
      var updatedRiskDescriptionText = document.getElementById('riskDescriptionText');
      expect(updatedRiskDescriptionText.innerHTML).to.be.equal('Your chance of having a heart attack, stroke, or other ' +
      'heart disease event at some point in the next 10 years is ');
      var updatedRiskDescriptionValue = document.getElementById('riskDescriptionValue');
      expect(updatedRiskDescriptionValue.innerHTML).to.be.equal('10%');

      mock.verify();
    });

    it ('updates correctly for score of high risk and UI updates', function() {

      CardiacRisk.patientInfo = {};

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeTenYearASCVD").returns(20);

      updateUICardiacRiskScore();

      var updatedRiskBar = document.getElementById('riskBar');
      expect(updatedRiskBar.className).to.be.equal('riskBarHighRisk');
      var updatedRiskMessage = document.getElementById('riskMessage');
      expect(updatedRiskMessage.innerHTML).to.be.equal('High Risk');
      var updatedRiskDescriptionText = document.getElementById('riskDescriptionText');
      expect(updatedRiskDescriptionText.innerHTML).to.be.equal('Your chance of having a heart attack, stroke, or other ' +
      'heart disease event at some point in the next 10 years is ');
      var updatedRiskDescriptionValue = document.getElementById('riskDescriptionValue');
      expect(updatedRiskDescriptionValue.innerHTML).to.be.equal('20%');

      mock.verify();
    });

  });

  describe ('updateASCVDRiskEstimates', function() {
    beforeEach(function() {
      var tenYearEstimate = document.createElement('div');
      tenYearEstimate.id = 'tenYearASCVDEstimate';
      document.body.appendChild(tenYearEstimate);

      var tenYearOptimalEstimate = document.createElement('div');
      tenYearOptimalEstimate.id = 'tenYearASCVDOptimalEstimate';
      document.body.appendChild(tenYearOptimalEstimate);

      var lifeEstimate = document.createElement('div');
      lifeEstimate.id = 'lifetimeASCVDEstimate';
      document.body.appendChild(lifeEstimate);

      var lifeOptimalEstimate = document.createElement('div');
      lifeOptimalEstimate.id = 'lifetimeASCVDOptimalEstimate';
      document.body.appendChild(lifeOptimalEstimate);
    });

    describe ('when ASCVD scores are null', function() {
      it ('displays an appropriate message', function() {
        CardiacRisk.patientInfo = {};

        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects("computeTenYearASCVD").returns(null);
        mock.expects("computeWhatIfOptimal").returns(null);
        mock.expects("computeLifetimeRisk").returns(null);
        mock.expects("computeLifetimeRisk").returns(null);

        updateASCVDRiskEstimates();

        var tenYearMessage = document.getElementById('tenYearASCVDEstimate');
        expect(tenYearMessage.innerHTML).to.be.equal('ASCVD 10-year Risk Estimate can only be ' +
            'computed for those in the age range of 20-79');

        var tenYearOptimalMessage = document.getElementById('tenYearASCVDOptimalEstimate');
        expect(tenYearOptimalMessage.innerHTML).to.be.equal('ASCVD 10-year Risk Estimate can only be ' +
            'computed for those in the age range of 20-79');

        var lifetimeMessage = document.getElementById('lifetimeASCVDEstimate');
        expect(lifetimeMessage.className).to.be.equal('contentHidden');

        var lifetimeOptimalMessage = document.getElementById('lifetimeASCVDOptimalEstimate');
        expect(lifetimeOptimalMessage.className).to.be.equal('contentHidden');

        mock.verify();
      });
    });

    describe ('when ASCVD scores are not null', function() {
      it ('displays scores and appropriate messages', function() {
        CardiacRisk.patientInfo = {};

        var mock = sinonSandbox.mock(CardiacRisk);
        mock.expects("computeTenYearASCVD").returns(50);
        mock.expects("computeWhatIfOptimal").returns(30);
        mock.expects("computeLifetimeRisk").returns(60);
        mock.expects("computeLifetimeRisk").returns(20);

        updateASCVDRiskEstimates();

        var tenYearMessage = document.getElementById('tenYearASCVDEstimate');
        expect(tenYearMessage.innerHTML).to.be.equal('ASCVD 10-year: ' + 50 + '%');

        var tenYearOptimalMessage = document.getElementById('tenYearASCVDOptimalEstimate');
        expect(tenYearOptimalMessage.innerHTML).to.be.equal('ASCVD 10-year (optimal): ' + 30 + '%');

        var lifetimeMessage = document.getElementById('lifetimeASCVDEstimate');
        expect(lifetimeMessage.innerHTML).to.be.equal('Lifetime ASCVD Risk Estimate: ' + 60 + '%');

        var lifetimeOptimalMessage = document.getElementById('lifetimeASCVDOptimalEstimate');
        expect(lifetimeOptimalMessage.innerHTML).to.be.equal('Lifetime ASCVD Risk Estimate ' +
            '(optimal): ' + 20 + '%');
      });
    });
  });

  describe ('updateUIWhatIfSystolicBloodPressure', function() {
    it ('updates the blood pressure UI correctly when undefined response', function () {

      var whatIfSBP = document.createElement('div');
      whatIfSBP.id = 'whatIfSBP';
      whatIfSBP.className = 'abc';
      document.body.appendChild(whatIfSBP);

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeWhatIfSBP").returns(undefined);

      updateUIWhatIfSystolicBloodPressure();

      var updatedWhatIfSBP = document.getElementById('whatIfSBP');
      expect(updatedWhatIfSBP.className).to.be.equal('abc contentHidden');
      mock.verify();
    });

    it ('updates the blood pressure UI correctly when defined response', function () {

      var whatIfSBP = document.createElement('div');
      whatIfSBP.id = 'whatIfSBP';
      whatIfSBP.className = 'abc contentHidden';
      document.body.appendChild(whatIfSBP);
      var whatIfSBPValue = document.createElement('span');
      whatIfSBPValue.id = 'whatIfSBPValue';
      whatIfSBPValue.innerHTML = 'abc';
      document.body.appendChild(whatIfSBPValue);
      var whatIfSBPValueText = document.createElement('span');
      whatIfSBPValueText.id = 'whatIfSBPValueText';
      whatIfSBPValueText.innerHTML= 'abc';
      document.body.appendChild(whatIfSBPValueText);

      var whatIfSBPResponse = {};
      whatIfSBPResponse.valueText = '119 mm/Hg';
      whatIfSBPResponse.value = '5%';

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeWhatIfSBP").returns(whatIfSBPResponse);

      updateUIWhatIfSystolicBloodPressure();

      var updatedWhatIfSBP = document.getElementById('whatIfSBP');
      expect(updatedWhatIfSBP.className).to.be.equal('abc');
      var updatedWhatIfSBPValue = document.getElementById('whatIfSBPValue');
      expect(updatedWhatIfSBPValue.innerHTML).to.be.equal('5%');
      var updatedWhatIfSBPValueText = document.getElementById('whatIfSBPValueText');
      expect(updatedWhatIfSBPValueText.innerHTML).to.be.equal('119 mm/Hg');

      mock.verify();
    });
  });

  describe ('updateUIWhatIfNotSmoker', function() {
    it('updates correctly is patient is a smoker', function () {

      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,true,false,'white',true, CardiacRisk.patientInfo);

      var whatIfNotSmoker = document.createElement('div');
      whatIfNotSmoker.id = 'whatIfNotSmoker';
      whatIfNotSmoker.className = 'abc contentHidden';
      document.body.appendChild(whatIfNotSmoker);

      var whatIfNoSmokerValue = document.createElement('span');
      whatIfNoSmokerValue.id = 'whatIfNoSmokerValue';
      whatIfNoSmokerValue.innerHTML = 'abc';
      document.body.appendChild(whatIfNoSmokerValue);

      var whatIfNotSmokerResponse = {};
      whatIfNotSmokerResponse.value = "whatIfNotSmoker";

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeWhatIfNotSmoker").returns(5);
      mock.expects("buildWhatIfNotSmoker").once().withExactArgs(5).returns(whatIfNotSmokerResponse);

      updateUIWhatIfNotSmoker();

      var updatedWhatIfNotSmoker = document.getElementById('whatIfNotSmoker');
      expect(updatedWhatIfNotSmoker.className).to.be.equal('abc');
      var updatedWhatIfNoSmokerValue = document.getElementById('whatIfNoSmokerValue');
      expect(updatedWhatIfNoSmokerValue.innerHTML).to.be.equal('whatIfNotSmoker');

      mock.verify();
    });

    it('updates correctly is patient is not a smoker', function () {

      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);

      var whatIfNotSmoker = document.createElement('div');
      whatIfNotSmoker.id = 'whatIfNotSmoker';
      whatIfNotSmoker.className = 'abc';
      document.body.appendChild(whatIfNotSmoker);

      var whatIfNotSmokerResponse = {};
      whatIfNotSmokerResponse.value = "whatIfNotSmoker";

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeWhatIfNotSmoker").never();
      mock.expects("buildWhatIfNotSmoker").never();

      updateUIWhatIfNotSmoker();

      var updatedWhatIfNotSmoker = document.getElementById('whatIfNotSmoker');
      expect(updatedWhatIfNotSmoker.className).to.be.equal('abc contentHidden');

      mock.verify();
    });
  });

  describe ('updateUIWhatIfOptimalValues', function() {
    it ('updates the optimal values correctly', function () {

      var whatIfOptimalValue = document.createElement('span');
      whatIfOptimalValue.id = 'whatIfOptimalValue';
      whatIfOptimalValue.className = 'abc contentHidden';
      document.body.appendChild(whatIfOptimalValue);

      var whatIfOptimalValueText = document.createElement('span');
      whatIfOptimalValueText.id = 'whatIfOptimalValueText';
      whatIfOptimalValueText.innerHTML = 'abc';
      document.body.appendChild(whatIfOptimalValueText);

      var whatIfOptimalResponse = {};
      whatIfOptimalResponse.value = '5%';
      whatIfOptimalResponse.valueText = 'value test text';

      var mock = sinonSandbox.mock(CardiacRisk);
      mock.expects("computeWhatIfOptimal").once().returns(5);
      mock.expects("buildWhatIfOptimalValues").once().withExactArgs(5).returns(whatIfOptimalResponse);

      updateUIWhatIfOptimalValues();

      var updatedWhatIfOptimalValue = document.getElementById('whatIfOptimalValue');
      expect(updatedWhatIfOptimalValue.innerHTML).to.be.equal('5%');
      var updatedWhatIfOptimalValueText = document.getElementById('whatIfOptimalValueText');
      expect(updatedWhatIfOptimalValueText.innerHTML).to.be.equal('value test text');

      mock.verify();
    });
  });

  describe ('createRangeSliderGraphs', function() {
    it ('invoked the specified methods', function() {
      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('buildRangeSliderDataModel').once();
      mockWindow.expects('createCholesterolSlider').once();
      mockWindow.expects('createHDLSlider').once();
      createRangeSliderGraphs();
      mockWindow.verify();
    });
  });

  describe ('createCholesterolSlider', function() {
    it ('invokes internal functions to create the slider totalCholesterol < 200', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.lowRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, '');
      createCholesterolSlider();

      expect(CardiacRisk.graphData.totalCholesterolSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[0]);
      expect(CardiacRisk.graphData.totalCholesterolSliderData.value).to.equal(160);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider totalCholesterol >= 200 && totalCholesterol < 240', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,210,60,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.moderateRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, '');
      createCholesterolSlider();

      expect(CardiacRisk.graphData.totalCholesterolSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[1]);
      expect(CardiacRisk.graphData.totalCholesterolSliderData.value).to.equal(210);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider totalCholesterol >= 240', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,300,60,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.highRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.totalCholesterolSliderData.id, CardiacRisk.colorClasses.rangeSliderThumbWhiteText);
      createCholesterolSlider();

      expect(CardiacRisk.graphData.totalCholesterolSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys[2]);
      expect(CardiacRisk.graphData.totalCholesterolSliderData.value).to.equal(300);

      mockWindow.verify();
    });
  });

  describe ('createHDLSlider', function() {
    it ('invokes internal functions to create the slider hdl < 40 for gender = male', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,30,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.highRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.rangeSliderThumbWhiteText);
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[2]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(30);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider hdl >= 40 && hdl < 60 for gender = male', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,50,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.moderateRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, '');
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[1]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(50);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider hdl >= 60 for gender = male', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,70,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.lowRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, '');
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[0]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(70);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider hdl < 50 for gender = female', function() {
      CardiacRisk.patientInfo = setPatientInfo('female',59,160,40,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.highRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.rangeSliderThumbWhiteText);
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[2]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(40);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider hdl >= 50 && hdl < 60 for gender = female', function() {
      CardiacRisk.patientInfo = setPatientInfo('female',59,160,50,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.moderateRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, '');
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[1]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(50);

      mockWindow.verify();
    });

    it ('invokes internal functions to create the slider hdl >= 60 for gender = female', function() {
      CardiacRisk.patientInfo = setPatientInfo('female',59,160,70,119,false,false,'white',true, CardiacRisk.patientInfo);
      buildRangeSliderDataModel();

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('generateRangeSlider').once().withExactArgs(CardiacRisk.graphData.hdlSliderData);
      mockWindow.expects('changeBarBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.grayBarColor);
      mockWindow.expects('changeThumbBackgroundColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, CardiacRisk.colorClasses.lowRisk);
      mockWindow.expects('changeThumbTextColor').once().withExactArgs(CardiacRisk.graphData.hdlSliderData.id, '');
      createHDLSlider();

      expect(CardiacRisk.graphData.hdlSliderData.thumbDisplayText).to.equal(CardiacRisk.graphData.hdlSliderData.toolTipData.keys[0]);
      expect(CardiacRisk.graphData.hdlSliderData.value).to.equal(70);

      mockWindow.verify();
    });
  });

  describe('adjustRelatedFactorsSize', function(){
    it('updates the UI element when invoked.', function(){

      var containerPatientActions = document.createElement('div');
      containerPatientActions.id = 'containerPatientActions';
      document.body.appendChild(containerPatientActions);

      document.getElementById('containerPatientActions').style.width = '99px';

      var containerPatientDetails = document.createElement('div');
      containerPatientDetails.id = 'containerPatientDetails';
      document.body.appendChild(containerPatientDetails);

      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);

      adjustRelatedFactorsSize();

      var updatedContainerPatientDetails = document.getElementById('containerPatientDetails');
      expect(updatedContainerPatientDetails.style.width).to.be.equal('99px');

    });
  });

  describe ('adjustRangeSliderThumbPosition', function() {
    it ('invokes the methods in the function', function() {
      CardiacRisk.patientInfo = setPatientInfo('male',59,160,60,119,false,false,'white',true, CardiacRisk.patientInfo);
      CardiacRisk.graphData = {};

      var totalCholesterolSliderData = {};
      totalCholesterolSliderData.id = 'data_id_chol';
      totalCholesterolSliderData.value = 'data_value_chol';
      totalCholesterolSliderData.lowerBound = 'data_lowerbound_chol';
      totalCholesterolSliderData.upperBound = 'data_upperbound_chol';

      var hdlSliderData = {};
      hdlSliderData.id = 'data_id_hdl';
      hdlSliderData.value = 'data_value_hdl';
      hdlSliderData.lowerBound = 'data_lowerbound_hdl';
      hdlSliderData.upperBound = 'data_upperbound_hdl';

      CardiacRisk.graphData.totalCholesterolSliderData = totalCholesterolSliderData;
      CardiacRisk.graphData.hdlSliderData = hdlSliderData;

      var mockWindow = sinonSandbox.mock(window);
      mockWindow.expects('updateThumbPosition').once().withExactArgs('data_id_chol','data_value_chol','data_lowerbound_chol','data_upperbound_chol');
      mockWindow.expects('updateThumbPosition').once().withExactArgs('data_id_hdl','data_value_hdl','data_lowerbound_hdl','data_upperbound_hdl');
      adjustRangeSliderThumbPosition();
      mockWindow.verify();
    });
  });

});