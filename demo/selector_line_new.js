var usePrior = false;
var leftError = 0.2;
var rightError = 0.2;
$(document).ready(function ($) {
        
    // Error slider
    $(function () {
        $("#slider").slider(
            {
                min: 0,
                max: 35,
                value: leftError * 100.0,
                slide: function (event, ui) {
                    var scaled = Number(ui.value) / 100.0 + 0.003;
                    leftError = scaled;
                    rightError = scaled;
                    $("#error_display").text(ui.value);
                }
            }
        );
    });

    // Entropy progressbar
    $(function () {
        $("#entropy_progressbar").progressbar({
            value: 0
        });
    });


    $("#error_display").text((100.0 * leftError).toFixed(0));

    // button handlers
    $("#incr_button").click(function () {
        increment();
    });

    $("#decr_button").click(function () {
        decrement();
    });

    $("#reset_button").click(function () {
        resetNumber();
    });

    $("#reset_button").click(function () {
        resetNumber();
    });


    $("#prior_button").button();

    

    $("#prior_button").click(function () {
        $el = $("#prior_button");
        usePrior = $el.is(':checked');
        resetNumber();
    });


    // **********************************
    // 
    // DRAWING CODE
    //
    // ***********************************

    var minValue = 0;
    var maxValue = 100;
    var k = Math.log(maxValue-minValue) / Math.log(2);
    var beta = 0.9;
    var targetEntropy = k + beta;

    var fontName = "Comfortaa";
    var pdfColor = "#fe9020";
    var darkColor = "#19535f";
    var medColor = "#0b7a75";
    var lightColor = "#d7c9aa";
    var bgColor = "#ffffff";

    var interval = new Interval();
    var priorInterval = new Interval();

    var number = (maxValue + minValue) / 2;


    var stage = new Kinetic.Stage({
        container: 'container',
        width: 600,
        height: 230,
        id:"KINETIC"

    });


    

    var layer = new Kinetic.Layer();
    var rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: bgColor
    });

    var base_inset = 25;
    var base_height = 40;
    var base_line = new Kinetic.Line(
        {
            points: [base_inset, stage.height() - base_height, stage.width() - base_inset, stage.height() - base_height],
            stroke: pdfColor,
            strokeWidth: 0.5
        });


    var bracket = new Kinetic.Line(
        {
            stroke: pdfColor,
            strokeWidth: 1,
            points: []
        });


    var needleText = new Kinetic.Text({
        text: "BANJO",
        fontFamily: fontName,
        fontSize: 10,
        fill: pdfColor,
        x: 50,
        y: stage.height() - base_height + text_offset,
    });




    function mapToLine(x) {
        var y = ((x - minValue) / (maxValue - minValue));
        y = y * (stage.width() - base_inset * 2);
        return y + base_inset;
    }

    function unitToLine(x) {
        var y = x * (stage.width() - base_inset * 2);
        return y + base_inset;
    }

    function updateBracket(x) {
        var x = mapToLine(x);
        var y1 = stage.height() - base_height + 20;
        var y2 = stage.height() - base_height - 100;
        bracket.points([x, y1, x, y2])
    }


    function updateNormal(x1, x2) {
        var xl = mapToLine(x1);
        var xr = mapToLine(x2);
        layer.draw();
    }

    var text_offset = 20;

    function makeLabels() {
        var i;
        var k = 10;
        for (i = 0; i <= k; i++) {
            var value = minValue + i * (maxValue - minValue) / k;

            var x = mapToLine(value);
            var tickText = new Kinetic.Text({
                text: value.toFixed(0),
                fontFamily: fontName,
                fontSize: 10,
                fill: medColor,
                x: mapToLine(value),
                y: stage.height() - base_height + text_offset,
            });

            tickText.offsetX(tickText.width() / 2);
            layer.add(tickText);

            var tick_height = 15;
            var tick = new Kinetic.Line(
                {
                    points: [x, stage.height() - base_height + tick_height, x, stage.height() - base_height - tick_height],
                    stroke: pdfColor,
                    strokeWidth: (i == 0 | i == k) ? 2.0 : 0.5
                });
            layer.add(tick);
        }

    }

    var bracket_interval = 0.25;
    function updateNumber() {
        n = interval.map(0.5) * (maxValue - minValue) + minValue;

        if (n > maxValue)
            n = maxValue;
        if (n < minValue)
            n = minValue;
        updateBracket(n);
        decimal_number = n.toFixed(2);
        base_entropy = interval.get_entropy();

        layer.draw();
        updatePDFs();
        number = Number(decimal_number);
        $("#number_display").text(decimal_number);
        $("#entropy_display").text("Entropy: " + (-base_entropy).toFixed(1) + " / " + targetEntropy.toFixed(1));
        var pct_entropy = 100.0 * (-base_entropy) / targetEntropy;
        if(pct_entropy>=100.0)
        {        
            $("#selected").html('Selected ' + n.toFixed(0));
            $("#selected").fadeIn(500);
            $("#container").css('visibility','hidden');
        }

        if ($("#entropy_progressbar").is(':ui-progressbar')) {
            $("#entropy_progressbar").progressbar("value", pct_entropy);
        }

        needleText.remove();
        needleText = new Kinetic.Text({
            text: decimal_number,
            fontFamily: fontName,
            fontSize: 40,
            fill: pdfColor,
            x: mapToLine(n),
            y: 50,
        });
        needleText.offsetX(needleText.getWidth() / 2);
        layer.add(needleText);


    }


    var pdf_height = 10;
    function addPDFBlock(pdf, color, map, y_offset) {
        y_scale = 1;

        last_x = null;
        var pdfLayer = new Kinetic.Group();
        for (i = 0; i < pdf.length; i++) {
            x = map(pdf[i][0]);
            y = pdf[i][1] * y_scale;
            alpha = pdf[i][1] * y_scale;
            if (alpha > 1.0) alpha = 1.0;
            if (last_x != null) {
                var block = new Kinetic.Rect({
                    width: last_x - x - 0.5,
                    height: pdf_height,
                    x: x,
                    y: stage.height() - base_height + 1 + y_offset,
                    stroke: false,
                    opacity: Math.sqrt(alpha),
                    fill: color
                });
                pdfLayer.add(block);
            }
            last_x = x;

        }
        return pdfLayer;
    }

    var base_entropy;
    function resetNumber() {
        interval = new Interval();
        priorInterval = new Interval();
        if (usePrior) {
            interval.load_pdf(pdf_unit);
        }
        $("#selected").fadeOut(1);
        $("#container").css('visibility','visible');
        updateNumber();
        updateNumber();

    }

    pdf = makeNormalPDF(minValue, maxValue, number, number / 4, 80);
    pdf_unit = scaleNormalizePDF(pdf);

    function showError(way) {
        if (way == "left") {

        }
        else {

        }
    }

    function flash(id)
    {
        $(id).fadeOut(100, function(){ $(id).css("background-color", "").fadeIn(200); });
        $(id).css("background-color", "#ff2020");
    }

    function increment() {
        if (Math.random() < rightError) {
            interval.left_split(leftError, rightError);
            flash("#incr_button");
        }
        else {
            interval.right_split(leftError, rightError);
        }


        updateNumber();
        updateNumber();

    }

    function decrement() {
        if (Math.random() < leftError) {
            interval.right_split(leftError, rightError);
            flash("#decr_button");
        }
        else {
            interval.left_split(leftError, rightError);
        }
        updateNumber();
        updateNumber();
    }

    layer.add(rect);
    layer.add(base_line);
    layer.add(bracket);
    makeLabels();

    var pdfs = new Kinetic.Group();
    function updatePDFs() {
        pdfs.removeChildren();
        if (usePrior) {
            var priorLayer = addPDFBlock(pdf, pdfColor, mapToLine, -pdf_height * 2);
            pdfs.add(priorLayer);
        }

        var posteriorLayer = addPDFBlock(interval.get_pdf(), darkColor, unitToLine, -pdf_height);
        pdfs.add(posteriorLayer);
    }
    updatePDFs();
    layer.add(pdfs);
    layer.add(needleText);
    resetNumber();
    stage.add(layer);
   
    

});