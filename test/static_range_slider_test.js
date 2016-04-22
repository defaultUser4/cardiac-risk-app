describe('StaticRangeSlider', function() {
	describe('buildRangeSliderDataModel', function(){
		it('returns a data model built for range slider when gender is male', function(){
			CardiacRisk.patientInfo = setPatientInfo('male',59,0.5,160,100,60,119,false,false);
			buildRangeSliderDataModel();

			expect(CardiacRisk.graphData).to.be.an('object');

			expect(CardiacRisk.graphData.crpSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.crpSliderData.id).to.be.equal('cReactiveProteinSlider');
			expect(CardiacRisk.graphData.crpSliderData.titleLeft).to.be.equal('C Reactive Protein');
			expect(CardiacRisk.graphData.crpSliderData.titleRight).to.be.equal('mg/L');
			expect(CardiacRisk.graphData.crpSliderData.lowerBound).to.be.equal(0.03);
			expect(CardiacRisk.graphData.crpSliderData.upperBound).to.be.equal(20);
			expect(CardiacRisk.graphData.crpSliderData.barBoundsLowDisplay).to.be.equal('Low');
			expect(CardiacRisk.graphData.crpSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.crpSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.keys).to.eql(['Low', 'Moderate', 'High']);
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.values).to.eql(['0.03 - 0.9', '1 - 2.9', '3 - 20']);
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskCRP');

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


			expect(CardiacRisk.graphData.ldlSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.ldlSliderData.id).to.be.equal('ldlBadCholesterolSlider');
			expect(CardiacRisk.graphData.ldlSliderData.titleLeft).to.be.equal('LDL "Bad" Cholesterol');
			expect(CardiacRisk.graphData.ldlSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.ldlSliderData.lowerBound).to.be.equal(50);
			expect(CardiacRisk.graphData.ldlSliderData.upperBound).to.be.equal(210);
			expect(CardiacRisk.graphData.ldlSliderData.barBoundsLowDisplay).to.be.equal('Optimal');
			expect(CardiacRisk.graphData.ldlSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.keys).to.eql(['Optimal', 'Near/Above Optimal', 'Borderline High', 'High', 'Very High']);
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.values).to.eql(['50 - 100', '101 - 129', '130 - 159', '160 - 189', '190 - 210']);
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskLDL');


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
			CardiacRisk.patientInfo = setPatientInfo('female',59,0.5,160,100,60,119,false,false);
			buildRangeSliderDataModel();

			expect(CardiacRisk.graphData).to.be.an('object');

			expect(CardiacRisk.graphData.crpSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.crpSliderData.id).to.be.equal('cReactiveProteinSlider');
			expect(CardiacRisk.graphData.crpSliderData.titleLeft).to.be.equal('C Reactive Protein');
			expect(CardiacRisk.graphData.crpSliderData.titleRight).to.be.equal('mg/L');
			expect(CardiacRisk.graphData.crpSliderData.lowerBound).to.be.equal(0.03);
			expect(CardiacRisk.graphData.crpSliderData.upperBound).to.be.equal(20);
			expect(CardiacRisk.graphData.crpSliderData.barBoundsLowDisplay).to.be.equal('Low');
			expect(CardiacRisk.graphData.crpSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.crpSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.keys).to.eql(['Low', 'Moderate', 'High']);
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.values).to.eql(['0.03 - 0.9', '1 - 2.9', '3 - 20']);
			expect(CardiacRisk.graphData.crpSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskCRP');

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


			expect(CardiacRisk.graphData.ldlSliderData).to.be.an('object');
			expect(CardiacRisk.graphData.ldlSliderData.id).to.be.equal('ldlBadCholesterolSlider');
			expect(CardiacRisk.graphData.ldlSliderData.titleLeft).to.be.equal('LDL "Bad" Cholesterol');
			expect(CardiacRisk.graphData.ldlSliderData.titleRight).to.be.equal('mg/dL');
			expect(CardiacRisk.graphData.ldlSliderData.lowerBound).to.be.equal(50);
			expect(CardiacRisk.graphData.ldlSliderData.upperBound).to.be.equal(210);
			expect(CardiacRisk.graphData.ldlSliderData.barBoundsLowDisplay).to.be.equal('Optimal');
			expect(CardiacRisk.graphData.ldlSliderData.barBoundsHighDisplay).to.be.equal('High');
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData).to.be.an('object');
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.keys).to.eql(['Optimal', 'Near/Above Optimal', 'Borderline High', 'High', 'Very High']);
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.values).to.eql(['50 - 100', '101 - 129', '130 - 159', '160 - 189', '190 - 210']);
			expect(CardiacRisk.graphData.ldlSliderData.toolTipData.styleClass).to.equal('tooltipsterCardiacRiskLDL');


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