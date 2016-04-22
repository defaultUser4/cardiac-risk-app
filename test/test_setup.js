
var sinonSandbox;
beforeEach(function () {
	sinonSandbox = sinon.sandbox.create();
});

afterEach(function () {
	sinonSandbox.restore();
});

var setPatientInfo = function(gender,age,hsCRP,totCholesterol,ldl,hdl,sysBP,smoker,familyHistory,patientInfo) {
	if (patientInfo === undefined) patientInfo = {};
	patientInfo.firstName = 'John';
	patientInfo.lastName = 'Doe';
	patientInfo.gender = gender;
	patientInfo.age = age;

	patientInfo.hsCReactiveProtein = hsCRP;
	patientInfo.totalCholesterol = totCholesterol;
	patientInfo.hdl = hdl;
	patientInfo.ldl = ldl;

	patientInfo.systolicBloodPressure = sysBP;
	var relatedFactors = {};
	relatedFactors.smoker = smoker;
	relatedFactors.familyHeartAttackHistory = familyHistory;
	patientInfo.relatedFactors = relatedFactors;
	return patientInfo;
};
