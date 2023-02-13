window.addEventListener('load', function () {
  'use strict';

  /**
   * Hex to RGB color converter that returns each RGB value seperatedly
   * @param {string} color 
   * @returns {string}
   */
   function hexToRgbValues(color) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    } else {
      return null;
    }
  }

  /**
   * A function that helps you check if a color is light or dark
   * @param {string} color 
   * @returns {string}
   */
   function lightOrDark(color) {
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

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {
      return 'light';
    } else {
      return 'dark';
    }
  }

  var root = document.querySelector(':root');
  var settings = window.SettingsObserver;
  const SCREEN_DARK_MODE_ENABLED = 'ui.dark-mode.enabled';
  const ACCENT_COLOR = 'theme.accent-color';
  var darkModeEnabled;
  var accentColorRGB;

  var previousScheme = '';
  var currentScheme = '';
  var previousAccentColor = '';
  var currentAccentColor = '';

  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML =
    '.dom-transition-72pGvMgE, .dom-transition-72pGvMgE * { transition: 0.5s ease !important; }';
  document.body.appendChild(style);

  setInterval(function () {
    // We update those so we don't end up being stuck with the saved setting it booted with.
    darkModeEnabled = settings.getValue(SCREEN_DARK_MODE_ENABLED);
    accentColorRGB = settings.getValue(ACCENT_COLOR);

    // Dark mode getter
    darkModeEnabled.onsuccess = function () {
      var result = darkModeEnabled.result[SCREEN_DARK_MODE_ENABLED];
      currentScheme = result ? 'dark' : 'light';

      if (previousScheme !== currentScheme) {
        root.dataset.theme = result ? 'dark' : 'light';
        document.body.classList.add('dom-transition-72pGvMgE');
        document.addEventListener('transitionend', function () {
          document.body.classList.remove('dom-transition-72pGvMgE');
        });
      }
      previousScheme = result ? 'dark' : 'light';
    };

    // Accent color getter
    accentColorRGB.onsuccess = function () {
      var result = accentColorRGB.result[ACCENT_COLOR];
      currentAccentColor = result;

      if (previousAccentColor !== currentAccentColor) {
        root.style.setProperty('--accent-color', result);
        var accentObject = hexToRgbValues(result);
        var brightness = (accentObject.r + accentObject.g + accentObject.b) / 3;
        root.dataset.accentScheme = lightOrDark(result) === 'dark' ? 'dark' : 'light';

        switch (lightOrDark(result)) {
          case 'light':
            root.style.setProperty(
              '--accent-text-color',
              accentObject.r * 0.25,
              accentObject.g * 0.25,
              accentObject.b * 0.25
            );
            break;

          case 'dark':
            root.style.setProperty(
              '--accent-text-color',
              accentObject.r * 1.75,
              accentObject.g * 1.75,
              accentObject.b * 1.75
            );
            break;

          default:
            break;
        }
      }
      previousAccentColor = result;
    };
  }, 1000);
});
