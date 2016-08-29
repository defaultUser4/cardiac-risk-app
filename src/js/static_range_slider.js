
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