
var sinonSandbox;
beforeEach(function () {
	sinonSandbox = sinon.sandbox.create();
});

afterEach(function () {
	sinonSandbox.restore();
});

var setPatientInfo = function(gender,age,totCholesterol,hdl,sysBP,smoker, hypertensive, race, diabetic, patientInfo) {
	if (patientInfo === undefined) patientInfo = {};
	patientInfo.firstName = 'John';
	patientInfo.lastName = 'Doe';
	patientInfo.gender = gender;
	patientInfo.age = age;

	patientInfo.totalCholesterol = totCholesterol;
	patientInfo.hdl = hdl;

	patientInfo.systolicBloodPressure = sysBP;
	var relatedFactors = {};
	relatedFactors.smoker = smoker;
	relatedFactors.hypertensive = hypertensive;
	relatedFactors.race = race;
	relatedFactors.diabetic = diabetic;
	patientInfo.relatedFactors = relatedFactors;
	return patientInfo;
};
