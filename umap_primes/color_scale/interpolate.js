function hex2rgb (hex) {
  return {
    // skip # at position 0
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255
  }
}

function zeroPadHex (hexStr) {
  return '00'.slice(hexStr.length) + hexStr
}

function rgb2hex (rgb) {
  // Map channel triplet into hex color code
  return '#' + [rgb.r, rgb.g, rgb.b]
    // Convert to hex (map [0, 1] => [0, 255] => Z => [0x0, 0xff])
    .map(function (ch) { return Math.round(ch * 255).toString(16) })
    // Make sure each channel is two digits long
    .map(zeroPadHex)
    .join('')
}

function interpolate (a, b) {
  a = hex2rgb(a)
  b = hex2rgb(b)

  var ar = a.r
  var ag = a.g
  var ab = a.b
  var br = b.r - ar
  var bg = b.g - ag
  var bb = b.b - ab

  return function (t) {
    return {
      r: ar + br * t,
      g: ag + bg * t,
      b: ab + bb * t
    }
  }
}

function interpolateArray (scaleArr) {
  var N = scaleArr.length - 2 // -1 for spacings, -1 for number of interpolate fns
  var intervalWidth = 1 / N
  var intervals = []

  for (var i = 0; i <= N; i++) {
    intervals[i] = interpolate(scaleArr[i], scaleArr[i + 1])
  }

  return function (t) {
    if (t < 0 || t > 1) throw new Error('Outside the allowed range of [0, 1]')

    var i = Math.floor(t * N)
    var intervalOffset = i * intervalWidth

    return intervals[i](t / intervalWidth - intervalOffset / intervalWidth)
  }
}
