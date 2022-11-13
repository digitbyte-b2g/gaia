document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  var root = document.querySelector(':root');
  var settings = navigator.mozSettings;
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
    darkModeEnabled = settings.createLock().get(SCREEN_DARK_MODE_ENABLED);
    accentColorRGB = settings.createLock().get(ACCENT_COLOR);

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
        var accentObject = hexToRgb(eval(result.replace('#', '0x')));
        var brightness = (accentObject.r + accentObject.g + accentObject.b) / 3;
        root.dataset.accentScheme = brightness > 200 ? 'light' : 'dark';

        if (brightness > 200) {
          root.style.setProperty(
            '--accent-text-color',
            accentObject.r * 0.25,
            accentObject.g * 0.25,
            accentObject.b * 0.25
          );
        } else {
          root.style.setProperty(
            '--accent-text-color',
            accentObject.r * 1.75,
            accentObject.g * 1.75,
            accentObject.b * 1.75
          );
        }
      }
      previousAccentColor = result;
    };
  }, 1000);
});
