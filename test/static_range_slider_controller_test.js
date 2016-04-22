
describe('StaticRangeSliderController', function(){
    describe('updateBarHeight', function(){
        it('updates the UI given the input arguments', function(){

            var bar = document.createElement('div');
            bar.id = 'elementIdBar';
            document.body.appendChild(bar);
            var header = document.createElement('header');
            header.id = 'elementIdHeader';
            document.body.appendChild(header);
            var thumb = document.createElement('div');
            thumb.id = 'elementIdThumb';
            thumb.className = 'abc';
            document.body.appendChild(thumb);
            var thumbDisplayText = document.createElement('div');
            thumbDisplayText.id = 'elementIdThumbDisplayText';
            thumbDisplayText.className = 'abc';
            document.body.appendChild(thumbDisplayText);
            var footer = document.createElement('footer');
            footer.id = 'elementIdFooter';
            footer.className = 'abc';
            document.body.appendChild(footer);

            updateBarHeight('elementId', 5);

            var updatedBar = document.getElementById('elementIdBar');
            expect(updatedBar.style.height).to.be.equal('5px');
            var updatedHeader = document.getElementById('elementIdHeader');
            expect(updatedHeader.style.marginBottom).to.be.equal('10px');
            var updatedThumb = document.getElementById('elementIdThumb');
            expect(updatedThumb.className).to.be.equal('abc barHeightThumbAdjustment');
            var updatedThumbDisplayText = document.getElementById('elementIdThumbDisplayText');
            expect(updatedThumbDisplayText.className).to.be.equal('abc barHeightThumbTextAdjustment');
            var updatedFooter = document.getElementById('elementIdFooter');
            expect(updatedFooter.className).to.be.equal('abc barFooterAdjustment');

        });
    });

    describe('changeBarBackgroundColor', function(){
        it('updates the UI accordingly', function(){

            var bar = document.createElement('div');
            bar.id = 'elementIdBar';
            bar.className = '';
            document.body.appendChild(bar);

            changeBarBackgroundColor('elementId', 'red');

            var updatedBar = document.getElementById('elementIdBar');
            expect(updatedBar.style.backgroundColor).to.be.equal('');
            expect(updatedBar.className).to.be.equal('red');

        });
    });

    describe('changeThumbBackgroundColor', function(){
        it('updates the UI accordingly', function() {

            var thumb = document.createElement('div');
            thumb.id = 'elementId1Thumb';
            thumb.className = '';
            document.body.appendChild(thumb);

            changeThumbBackgroundColor('elementId1', 'red');

            var updatedThumb = document.getElementById('elementId1Thumb');
            expect(updatedThumb.style.backgroundColor).to.be.equal('');
            expect(updatedThumb.className).to.be.equal('red');

        });
    });

    describe('changeThumbTextColor', function(){
        it('updates the UI accordingly', function() {

            var thumb = document.createElement('div');
            thumb.id = 'elementId2Thumb';
            thumb.className = '';
            document.body.appendChild(thumb);

            changeThumbTextColor('elementId2', 'red');

            var updatedThumb = document.getElementById('elementId2Thumb');
            expect(updatedThumb.style.color).to.be.equal('');
            expect(updatedThumb.className).to.be.equal('red');

        });
    });

    describe('changeThumbPositionToPosition', function(){
        it('updates the UI accordingly', function() {

            var thumb = document.createElement('div');
            thumb.id = 'elementId3Thumb';
            document.body.appendChild(thumb);

            document.getElementById('elementId3Thumb').style.left = 2;
            changeThumbTextColor('elementId', '2');

            var updatedThumb = document.getElementById('elementId3Thumb');
            expect(updatedThumb.style.left).to.be.equal('2px');

        });
    });
});