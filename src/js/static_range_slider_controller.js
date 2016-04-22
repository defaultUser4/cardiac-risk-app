/**
 * Generic method to create the range slider component.
 * @param data This is the data structure needed to build the component.
 *   Structure :
 *      id : The div id to be use to reference the component.
 *      titleLeft : Title text for the left header.
 *      titleRight : Title text for the right header.
 *      lowerBound : Lower bound value for the bar calculations.
 *      upperBound : Upper bound value for the bar calculations.
 *      barBoundsLowDisplay : Display text for the footer left bar bounds.
 *      barBoundsHighDisplay : Display text for the footer right bar bounds.
 *      toolTipData :
 *      {
            "keys" : Array of left column text.
                    Eg. ["Low", "Moderate", "High"]
            "values": Array of right column text.
                    Eg. ["0.03 - 0.9", "1 - 2.9", "3 - 20"]
            "styleClass": Styling class.
        }
 *      barHeight : Height to be used for the bar component of the graph.
 */
function generateRangeSlider(data) {
    var $sliderDiv = $('#' + data.id);
    $sliderDiv.append(
        '<header id=' + data.id + 'Header' + ' class="rangeSliderHeaderStyle">' +
            '<div>' +
                '<span id=' + data.id + 'TitleLeft' + ' class="headerLeftStyle">'+ data.titleLeft +'</span>' +
                '<span id=' + data.id + 'Image' + ' class="iconStyle fa fa-info-circle"></span>' +
        '   </div>' +
            '<span id=' + data.id + 'TitleRight' + '>'+ data.titleRight +'</span>' +
        '</header>' +
        '<div class="rangeSliderContentStyle">' +
            '<div id=' + data.id + 'Bar' + ' class="rangeSliderBarStyle"></div>' +
            '<div id=' + data.id + 'Thumb' + ' class="rangeSliderThumbStyle">'+ data.value +'</div>' +
            '<div id=' + data.id + 'ThumbDisplayText' + ' class="rangeSliderThumbDisplayTextStyle">' + data.thumbDisplayText + '</div>' +
        '</div>' +
        '<footer id=' + data.id + 'Footer' + ' class="rangeSliderFooterStyle">' +
            '<div class="footerLeftStyle">' +
                '<span id=' + data.id + 'FooterLeft' + '>'+ data.barBoundsLowDisplay +'</span>' +
            '</div>' +
            '<div class="footerRightStyle">' +
                '<span id=' + data.id + 'FooterRight' + '>'+ data.barBoundsHighDisplay +'</span>' +
            '</div>' +
        '</footer>'
    );
    updateBarHeight(data.id, data.barHeight);
    updateToolTips(data.id, data.toolTipData);
    updateThumbPosition(data.id, data.value, data.lowerBound, data.upperBound);
}

/**
 * Method to update the content of tool tip for the more information icon.
 * @param id Indicates the div id to be used to update the tooltip.
 * @param toolTipData
 */
function updateToolTips(id, toolTipData) {
    var contentString = '<table class="'+ toolTipData.styleClass + '">';
    var tableRows = '';

    for (step = 0; step < toolTipData.keys.length ;step++) {
        tableRows = tableRows.concat('<tr>');
        tableRows = tableRows.concat(
            '<td class="zeroMargin">'+ toolTipData.keys[step] +'</td>' +
            '<td> </td>' +
            '<td class="zeroMargin">' + toolTipData.values[step] + '</td>'
        );
        tableRows = tableRows.concat('</tr>');
    }
    contentString = contentString.concat(tableRows, '</table>');

    $('#' + id + 'Image').tooltipster({
        contentAsHTML : true,
        delay : 100,
        theme: 'tooltipster-CardiacRisk',
        content: $(contentString)
    });
}

/**
 * Method to update the bar height in the graph.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param barHeight : Indicates the height to use.
 */
function updateBarHeight(id, barHeight) {
    $('#' + id + 'Bar').css('height', '');
    $('#' + id + 'Bar').css('height', barHeight);
    if (barHeight < 12)
    {
        $('#' + id + 'Header').css('margin-bottom',2 * barHeight);
        $('#' + id + 'Thumb').addClass('barHeightThumbAdjustment');
        $('#' + id + 'ThumbDisplayText').addClass('barHeightThumbTextAdjustment');
        $('#' + id + 'Footer').addClass('barFooterAdjustment');
    }
}

/**
 * Method to change background color of the bar.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeBarBackgroundColor(id, color) {
    $('#' + id + 'Bar').css('background-color', '');
    $('#' + id + 'Bar').addClass(color);
}

/**
 * Method to change the thumb's background color
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeThumbBackgroundColor(id, color) {
    $('#' + id + 'Thumb').css('background-color', '');
    $('#' + id + 'Thumb').addClass(color);
}

/**
 * Method to change the thumb's text color
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param color
 */
function changeThumbTextColor(id, color) {
    if (color.length) {
        $('#' + id + 'Thumb').removeClass('rangeSliderThumbStyle').addClass(color);
    }
}

/**
 * Method to update the thumb's left position based on the data value.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param value : The value indicating the actual data value.
 * @param lowerBound : Value for the lower bound.
 * @param upperBound : Value for the upper bound.
 */
function updateThumbPosition(id, value, lowerBound, upperBound) {
    var thumbOffset = 0;
    if (value <= lowerBound) {
        thumbOffset = 0;
        changeThumbPositionToPosition(id, thumbOffset);
        changeThumbValueTextToPosition(id, thumbOffset);
        return;
    }

    var $barWidth = $('#' + id + 'Bar').width();
    var $thumb = $('#' + id + 'Thumb');
    var thumbWidthAdjustment = $thumb.width() +
        parseFloat($thumb.css('padding-left').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('padding-right').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderLeftWidth').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderRightWidth').replace(/[^-\d.]/g, ''));
    var valueToConsider = value;
    if (value > upperBound) {
        valueToConsider = upperBound;
    }
    var position = ((valueToConsider - lowerBound)/(upperBound - lowerBound)) * $barWidth;
    thumbOffset = position - thumbWidthAdjustment;
    if (thumbOffset < 0) {
        thumbOffset = 0;
    }
    changeThumbPositionToPosition(id, thumbOffset);
    changeThumbValueTextToPosition(id, thumbOffset);
}

/**
 * Method to change the thumb's value text position. This is calculated based on the thumb's position.
 * If this calculated position overlaps the left bounds text or right bounds text then the left or right bounds
 * labels are hidden.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param offset : Indicates the thumb's left offset.
 */
function changeThumbValueTextToPosition(id, offset) {

    var $thumb = $('#' + id + 'Thumb');
    var $barWidth = $('#' + id + 'Bar').width();
    var $thumbDisplayWidth = $('#' + id + 'ThumbDisplayText').width();
    var thumbWidth = $thumb.width() +
        parseFloat($thumb.css('padding-left').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('padding-right').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderLeftWidth').replace(/[^-\d.]/g, '')) +
        parseFloat($thumb.css('borderRightWidth').replace(/[^-\d.]/g, ''));
    var offsetForDisplay = offset + (thumbWidth / 2) - ($thumbDisplayWidth / 2);
    if (offsetForDisplay < 0) offsetForDisplay = 0;
    if (offsetForDisplay > ($barWidth - $thumbDisplayWidth)) offsetForDisplay = $barWidth - $thumbDisplayWidth;

    $('#' + id + 'ThumbDisplayText').css('left', '');
    $('#' + id + 'ThumbDisplayText').css('left', offsetForDisplay);

    if (offsetForDisplay >= 0 && offsetForDisplay <= $('#' + id + 'FooterLeft').width()) {
        $('#' + id + 'FooterLeft').css('visibility', 'hidden');
    }
    else {
        if ((offsetForDisplay + $thumbDisplayWidth) <= $barWidth && (offsetForDisplay + $thumbDisplayWidth) >= $barWidth - $('#' + id + 'FooterRight').width()) {
            $('#' + id + 'FooterRight').css('visibility', 'hidden');
        }
    }
}

/**
 * Method to change the thumb's position.
 * @param id : Indicates the div id to be used to update the tooltip.
 * @param offset : Indicates the value to position the thumb.
 */
function changeThumbPositionToPosition(id, offset) {
    $('#' + id + 'Thumb').css('left', '');
    $('#' + id + 'Thumb').css('left', offset);
}
