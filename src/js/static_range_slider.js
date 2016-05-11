
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

	if (CardiacRisk.patientInfo.ldl !== undefined) {
		var ldlSliderData = {};
		ldlSliderData.id = 'ldlBadCholesterolSlider';
		ldlSliderData.titleLeft = 'LDL "Bad" Cholesterol';
		ldlSliderData.titleRight = 'mg/dL';
		ldlSliderData.lowerBound = 50;
		ldlSliderData.upperBound = 210;
		ldlSliderData.barBoundsLowDisplay = 'Optimal';
		ldlSliderData.barBoundsHighDisplay = 'High';
		ldlSliderData.toolTipData = {
			'keys' : ['Optimal', 'Near/Above Optimal', 'Borderline High', 'High', 'Very High'],
			'values': ['50 - 100', '101 - 129', '130 - 159', '160 - 189', '190 - 210'],
			'styleClass': 'tooltipsterCardiacRiskLDL'
		};
		ldlSliderData.barHeight = 6;
		graphData.ldlSliderData = ldlSliderData;
	}

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