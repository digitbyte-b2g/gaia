(function(exports) {
  'use strict';

  /**
   * RGB to Hex color converter
   * @param {string} color 
   * @returns {string}
   */
  function rgbToHex(color) {
    var r;
    var g;
    var b;
    var hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

      r = color[1];
      g = color[2];
      b = color[3];
    } else {
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
      r = color >> 16;
      g = (color >> 8) & 255;
      b = color & 255;
    }

    function cth(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + cth(r) + cth(g) + cth(b);
  }

  exports.rgbToHex = rgbToHex;
})(window);