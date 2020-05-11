
// Scale a PDF's units from [minVal, maxVal] to [0,1]
// and normalise the pdf 
function scaleNormalizePDF(pdf) {
    var i, total, p;
    var out_pdf = [];
    total = 0;
    var maxValue, minValue;
    for (i = 0; i < pdf.length; i++) {
        total = total + pdf[i][1];
        if (minValue === undefined || pdf[i][0] < minValue)
            minValue = pdf[i][0];
        if (maxValue === undefined || pdf[i][0] > maxValue)
            maxValue = pdf[i][0];
    }
    for (i = 0; i < pdf.length; i++) {
        out_pdf[i] = [(pdf[i][0] - minValue) / (maxValue - minValue), pdf[i][1] / total];
    }
    return out_pdf;
}

function makeNormalPDF(min, max, mean, std, res) {
    pdf = [];
    j = 0;
    for (i = min; i < max; i += (max - min) / res) {

        x = ((i - mean) * (i - mean)) / (std * std);
        p = 1.0 / (2 * Math.PI * std) * Math.exp(-x);
        p = Math.exp(-x);
        pdf[j] = [i, p];
        j = j + 1;
    }
    return pdf;
}

function getPDFValue(x, pdf) {

    var p = 0;
    var last_xi = pdf[0][0];
    for (i = 0; i < pdf.length; i++) {
        xi = pdf[i][0];
        y = pdf[i][1];
        if (x > last_xi && x <= xi) {
            p = y;
        }
        last_xi = xi;

    }

    return p;
}

function Interval() {
    // reset the interval
    function reset() {
        this.segments = [[0.0, 1.0, 1.0]];
    }

    // Return the slope at a given input point
    function get_slope(where) {
        var i = 0;
        var start, stop, slope;
        for (i = 0; i < this.segments.length; i++) {
            var bk = this.segments[i];
            start = bk[0];
            stop = bk[1];
            slope = bk[1];
            if (where >= start && where <= stop) {
                return slope;
            }
        }
        return 0;
    }

    // return the entropy of the interval
    function get_entropy() {
        var pts, prev_x, prev_y, h, x, y, p, i;
        pts = this.get_breakpoints();
        prev_x = -1;
        prev_y = -1;
        h = 0;
        for (i = 0; i < pts.length; i++) {
            x = pts[i][0];
            y = pts[i][1];
            if (prev_x != -1) {
                p = (y - prev_y) / (x - prev_x);
                if (p > 0) {
                    h -= (p * (Math.log(p) / Math.log(2))) * (x - prev_x);
                }
            }
            prev_x = x;
            prev_y = y;

        }
        return h;
    }

    //return the pdf of the decoder
    function get_pdf() {
        var dpts = [];
        var pts, prev_x, prev_y, h, x, y, p, i, dx, dy;
        pts = this.get_breakpoints();
        prev_x = -1;
        prev_y = -1;

        for (i = 0; i < pts.length; i++) {
            x = pts[i][0];
            y = pts[i][1];

            if (prev_x != -1) {
                dx = x - prev_x;
                dy = y - prev_y;
                dpts.push([prev_x, dy / dx]);
                dpts.push([x, dy / dx]);
            }
            prev_x = x;
            prev_y = y;
        }
        return dpts;
    }

    // return the breakpoints of the interval function
    function get_breakpoints() {
        var i, y;
        var pts, bk, start, stop, slope;
        pts = [];
        y = 0;
        for (i = 0; i < this.segments.length; i++) {
            bk = this.segments[i];
            start = bk[0];
            stop = bk[1];
            slope = bk[2];
            pts.push([start, y]);
            y = y + (stop - start) * slope;
        }
        pts.push([stop, y]);
        return pts;
    }

    // Find the intersection between y=where and the function
    // e.g. map(0.5) returns the median
    function map(where) {
        var y, bk, last_y, i, deficit, split_x;
        y = 0;
        last_y = 0;
        if (where == 0.0) return 0.0;
        for (i = 0; i < this.segments.length; i++) {
            bk = this.segments[i];
            start = bk[0];
            stop = bk[1];
            slope = bk[2];
            y += (stop - start) * slope;
            if (last_y < where && y >= where) {
                deficit = where - last_y;
                split_x = deficit / slope + start;
                return split_x;
            }
            last_y = y;
        }
        return 1.0;
    }

    // find the intersection between the line x=where and the function
    // inverse_map(map(y)) == y
    function inverse_map(where) {
        var y, bk, i, start, stop, slope;
        y = 0;
        if (where == 0.0) return 0.0;
        for (i = 0; i < this.segments.length; i++) {
            bk = this.segments[i];
            start = bk[0];
            stop = bk[1];
            slope = bk[2];
            if (where >= start && where <= stop) {
                y += (where - start) * slope;
                return y;
            }
            y += (where - start) * slope;
        }
        return 0.0;
    }

    // Split the breakpoints so the left has slopes multiplied by
    // p and the right by q
    function split(p, q, at) {
        var y, last_y, i, bk, left, right, new_left, new_right;
        var deficit, split_x, index;
        var stop, start, slope;
        y = 0;
        last_y = 0;
        if (at == 0) {
            for (i = 0; i < this.segments.length; i++) {
                this.segments[i][2] = 2 * q * this.segments[i][2];
            }
            return 0;
        }

        if (at == 1) {
            for (i = 0; i < this.segments.length; i++) {
                this.segments[i][2] = 2 * p * this.segments[i][2];
            }
            return this.segments.length - 1;
        }
        index = this.segments.length - 1;
        for (i = 0; i < this.segments.length; i++) {
            bk = this.segments[i];
            start = bk[0];
            stop = bk[1];
            slope = bk[2];

            y += (stop - start) * slope;
            if (last_y < at && y >= at) {
                deficit = at - last_y;
                split_x = deficit / slope + start;
                index = i;
                break;
            }
            last_y = y;
        }

        bk = this.segments[index];

        left = this.segments.slice(0, index);
        right = this.segments.slice(index + 1, this.segments.length);
        new_left = [bk[0], split_x, bk[2]];
        new_right = [split_x, bk[1], bk[2]];

        left.push(new_left);
        right.unshift(new_right);

        for (i = 0; i < left.length; i++) {
            left[i][2] = 2 * p * left[i][2];
        }
        for (i = 0; i < right.length; i++) {
            right[i][2] = 2 * q * right[i][2];
        }

        this.segments = left.concat(right);
        return index;
    }

    // Split the function to the left, with probabilities of error
    // f_left and f_right
    function left_split(f_left, f_right) {
        p0 = (1 - f_left) / ((1 - f_left) + f_right);
        this.split(p0, 1 - p0, 0.5);
    }

    // Split the function to the right, with probabilities of error
    // f_left and f_right        
    function right_split(f_left, f_right) {
        p1 = (1 - f_right) / ((1 - f_right) + f_left);
        this.split(1 - p1, p1, 0.5);
    }

    function get_radius(around, test) {
        var left = this.map(around - test);
        var right = this.map(around + test);
        return (right - left) / (test * 2);
    }

    // take a (normalized!) pdf on the interval [0,1] and load it into the interval
    // as a prior
    function load_pdf(pdf) {
        var i, x, p, delta;
        var last_x = -1;
        this.segments = [];
        for (i = 0; i < pdf.length; i++) {
            x = pdf[i][0];
            p = pdf[i][1];
            if (last_x >= 0) {
                delta = x - last_x;
                slope = p / delta;
                this.segments.push([last_x, x, slope]);
            }
            last_x = x;
        }
    }

    this.load_pdf = load_pdf;
    this.reset = reset;
    this.get_slope = get_slope;
    this.get_entropy = get_entropy;
    this.get_pdf = get_pdf;
    this.get_breakpoints = get_breakpoints;
    this.map = map;
    this.inverse_map = inverse_map;
    this.split = split;
    this.left_split = left_split;
    this.right_split = right_split;
    this.get_radius = get_radius;
    this.reset();
}