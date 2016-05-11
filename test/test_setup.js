
var sinonSandbox;
beforeEach(function () {
	sinonSandbox = sinon.sandbox.create();
});

afterEach(function () {
	sinonSandbox.restore();
});

var setPatientInfo = function(gender,age,totCholesterol,ldl,hdl,sysBP,smoker,familyHistory,patientInfo) {
	if (patientInfo === undefined) patientInfo = {};
	patientInfo.firstName = 'John';
	patientInfo.lastName = 'Doe';
	patientInfo.gender = gender;
	patientInfo.age = age;

	patientInfo.totalCholesterol = totCholesterol;
	patientInfo.hdl = hdl;
	patientInfo.ldl = ldl;

	patientInfo.systolicBloodPressure = sysBP;
	var relatedFactors = {};
	relatedFactors.smoker = smoker;
	patientInfo.relatedFactors = relatedFactors;
	return patientInfo;
};
