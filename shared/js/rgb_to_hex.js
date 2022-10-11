'use strict';

/**
 * RGB to Hex color converter.
 * @param {String} r 
 * @param {String} g 
 * @param {String} b 
 * @returns 
 */
function rgbToHex(r, g, b) {
  function cth(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  return "#" + cth(r) + cth(g) + cth(b);
}
