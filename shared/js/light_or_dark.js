'use strict';

function lightOrDark(color) {
  var computedColor = color;
  var colorCodes = /rgb\((\d+), (\d+), (\d+)\)/.exec(computedColor);
  if (!colorCodes || colorCodes.length === 0) {
    return;
  }

  var r = parseInt(colorCodes[1]);
  var g = parseInt(colorCodes[2]);
  var b = parseInt(colorCodes[3]);
  var brightness =
    Math.sqrt((r*r) * 0.241 + (g*g) * 0.691 + (b*b) * 0.068);

  var isLight = brightness > 200;
  return isLight;
}
