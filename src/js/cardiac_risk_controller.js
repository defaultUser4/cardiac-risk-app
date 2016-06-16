
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
   * Checks for the validity of available parameters to calculate the RRS.
   * This method will display an Incomplete state UI at the beginning of the app since the availability of
   * patients related factors is unknown.
   */
  function checkForIncompleteState() {
    if (!CardiacRisk.canCalculateCardiacRiskScore()) {
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
    else
    {
      $('#sbpInput').val(CardiacRisk.patientInfo.systolicBloodPressure);
    }
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
    $('[name="hypertension"]').change(onHypertensionInput);
    $('[name="race"]').change(onRaceInput);
    $('[name="diabetic"]').change(onDiabeticInput);
  }

  /**
   * Event listener method for systolic blood pressure input box.
   * This method will check for :
   *    1. valid systolic blood pressure value
   *    2. update the CardiacRisk data model
   *    3. update UI if the RRS can be calculated.
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

      if (CardiacRisk.canCalculateCardiacRiskScore()) {
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

    if (CardiacRisk.canCalculateCardiacRiskScore()) {
      updateUI();
    }
  }

  /**
   * Event listener method for the hypertension status radio button value change.
   */
  function onHypertensionInput() {
    if (CardiacRisk.patientInfo.relatedFactors.hypertension === undefined) {
      $('#legendHypertensionError').toggleClass('relatedFactorsErrors relatedFactorsErrorsHidden');
      $('#asteriskHypertension').removeClass().addClass('contentHidden');
    }

    if ($(this).val() === 'yes') {
      // Save the user viewed hypertension condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.hypertension = true;
    } else {
      // Save the user viewed hypertension condition value in our dataObject for future references.
      CardiacRisk.patientInfo.relatedFactors.hypertension = false;
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
   * Method to update the UI for cardiac risk score based on the RRS calculation.
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
          ' range of 40-79');
      $('#tenYearASCVDOptimalEstimate').text('ASCVD 10-year Risk Estimate can only be computed for those in the age' +
          ' range of 40-79');
    } else {
      $('#tenYearASCVDEstimate').text('ASCVD 10-year: ' + tenYearASCVDScore + '%');
      $('#tenYearASCVDOptimalEstimate').text('ASCVD 10-year (optimal): ' + tenYearASCVDOptimalScore + '%');
    }

    if (lifetimeASCVDScore === null || lifetimeASCVDOptimalScore === null) {
      $('#lifetimeASCVDEstimate').text('Lifetime ASCVD Risk Estimate can only be computed for those in the ' +
          'age range of 20-59');
      $('#lifetimeASCVDEstimate').text('Lifetime ASCVD Risk Estimate can only be computed for those in the ' +
          'age range of 20-59');
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
    createLDLSlider();
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
   * Method to create the LDL slider based on the ldl value from the
   * Cardiac Risk data model.
   */
  function createLDLSlider() {
    if (CardiacRisk.patientInfo.ldl === undefined)
    {
      $('#ldlBadCholesterolSlider').addClass('contentHidden');
      $('#rangeSlidersVerticalLine').removeClass().addClass('verticalLineHalf');
    }
    else
    {
      var thumbDisplayText = '', thumbBackgroundColor = '', thumbTextColor = '';
      if (CardiacRisk.patientInfo.ldl < 100) {
        thumbDisplayText = CardiacRisk.graphData.ldlSliderData.toolTipData.keys[0];
        thumbBackgroundColor = CardiacRisk.colorClasses.lowRisk;
      }
      else if (CardiacRisk.patientInfo.ldl >= 100 && CardiacRisk.patientInfo.ldl < 130) {
        thumbDisplayText = CardiacRisk.graphData.ldlSliderData.toolTipData.keys[1];
        thumbBackgroundColor = CardiacRisk.colorClasses.lowModerateRisk;
      }
      else if (CardiacRisk.patientInfo.ldl >= 130 && CardiacRisk.patientInfo.ldl < 160) {
        thumbDisplayText = CardiacRisk.graphData.ldlSliderData.toolTipData.keys[2];
        thumbBackgroundColor = CardiacRisk.colorClasses.moderateRisk;
      }
      else if (CardiacRisk.patientInfo.ldl >= 160 && CardiacRisk.patientInfo.ldl < 190) {
        thumbDisplayText = CardiacRisk.graphData.ldlSliderData.toolTipData.keys[3];
        thumbBackgroundColor = CardiacRisk.colorClasses.highRisk;
        thumbTextColor = CardiacRisk.colorClasses.rangeSliderThumbWhiteText;
      }
      else if (CardiacRisk.patientInfo.ldl >= 190) {
        thumbDisplayText = CardiacRisk.graphData.ldlSliderData.toolTipData.keys[4];
        thumbBackgroundColor = CardiacRisk.colorClasses.highRisk;
        thumbTextColor = CardiacRisk.colorClasses.rangeSliderThumbWhiteText;
      }

      CardiacRisk.graphData.ldlSliderData.thumbDisplayText = thumbDisplayText;
      CardiacRisk.graphData.ldlSliderData.value = CardiacRisk.patientInfo.ldl;
      generateRangeSlider(CardiacRisk.graphData.ldlSliderData);
      changeBarBackgroundColor(CardiacRisk.graphData.ldlSliderData.id, CardiacRisk.colorClasses.grayBarColor);

      changeThumbBackgroundColor(CardiacRisk.graphData.ldlSliderData.id, thumbBackgroundColor);
      changeThumbTextColor(CardiacRisk.graphData.ldlSliderData.id, thumbTextColor);
    }
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
    updateThumbPosition(CardiacRisk.graphData.ldlSliderData.id,
        CardiacRisk.graphData.ldlSliderData.value,
        CardiacRisk.graphData.ldlSliderData.lowerBound,
        CardiacRisk.graphData.ldlSliderData.upperBound);
    updateThumbPosition(CardiacRisk.graphData.hdlSliderData.id,
        CardiacRisk.graphData.hdlSliderData.value,
        CardiacRisk.graphData.hdlSliderData.lowerBound,
        CardiacRisk.graphData.hdlSliderData.upperBound);
  }
