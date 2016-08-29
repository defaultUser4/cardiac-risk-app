describe('StaticRangeSlider', function() {
	describe('buildRangeSliderDataModel', function(){
		it('returns a data model built for range slider when gender is male', function(){
			CardiacRisk.patientInfo = setPatientInfo('male',59,0.5,100,60,119,false,false);
			buildRangeSliderDataModel();

			expect(CardiacRisk.graphData).to.be.an('object');

			expect(CardiacRisk.graphData.totalCholesterolSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.id).to.be.equal('totalCholesterolSlider');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.titleLeft).to.be.equal('Total Cholesterol');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.lowerBound).to.be.equal(140);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.upperBound).to.be.equal(401);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.barBoundsLowDisplay).to.be.equal('Desirable');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys).to.eql(['Desirable', 'Borderline High', 'High']);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.values).to.eql(['140 - 199', '200 - 239', '240 - 401']);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskTotalCholesterol');


			expect(CardiacRisk.graphData.hdlSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.hdlSliderData.id).to.be.equal('hdlGoodCholesterolSlider');
			expect(CardiacRisk.graphData.hdlSliderData.titleLeft).to.be.equal('HDL "Good" Cholesterol');
			expect(CardiacRisk.graphData.hdlSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.hdlSliderData.lowerBound).to.be.equal(30);
			expect(CardiacRisk.graphData.hdlSliderData.upperBound).to.be.equal(150);
			expect(CardiacRisk.graphData.hdlSliderData.barBoundsLowDisplay).to.be.equal('Protective');
			expect(CardiacRisk.graphData.hdlSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.keys).to.eql(['High', 'Higher the Better', 'Low']);
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.values).to.eql(['60 - 150', '40 - 59', '30 - 39']);
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskHDL');
		});

		it('returns a data model built for range slider when gender is female', function(){
			CardiacRisk.patientInfo = setPatientInfo('female',59,0.5,100,60,119,false,false);
			buildRangeSliderDataModel();

			expect(CardiacRisk.graphData).to.be.an('object');

			expect(CardiacRisk.graphData.totalCholesterolSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.id).to.be.equal('totalCholesterolSlider');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.titleLeft).to.be.equal('Total Cholesterol');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.lowerBound).to.be.equal(140);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.upperBound).to.be.equal(401);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.barBoundsLowDisplay).to.be.equal('Desirable');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.keys).to.eql(['Desirable', 'Borderline High', 'High']);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.values).to.eql(['140 - 199', '200 - 239', '240 - 401']);
			expect(CardiacRisk.graphData.totalCholesterolSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskTotalCholesterol');



			expect(CardiacRisk.graphData.hdlSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.hdlSliderData.id).to.be.equal('hdlGoodCholesterolSlider');
			expect(CardiacRisk.graphData.hdlSliderData.titleLeft).to.be.equal('HDL "Good" Cholesterol');
			expect(CardiacRisk.graphData.hdlSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.hdlSliderData.lowerBound).to.be.equal(30);
			expect(CardiacRisk.graphData.hdlSliderData.upperBound).to.be.equal(150);
			expect(CardiacRisk.graphData.hdlSliderData.barBoundsLowDisplay).to.be.equal('Protective');
			expect(CardiacRisk.graphData.hdlSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.keys).to.eql(['High', 'Higher the Better', 'Low']);
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.values).to.eql(['60 - 150', '50 - 59', '30 - 49']);
			expect(CardiacRisk.graphData.hdlSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskHDL');
		});
	});
});