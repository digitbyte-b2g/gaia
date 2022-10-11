document.addEventListener('DOMContentLoaded', function() {
  'use strict';

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
  style.innerHTML = '.dom-transition-72pGvMgE, .dom-transition-72pGvMgE * { transition: 0.5s ease !important; }';
  document.body.appendChild(style);

  setInterval(function() {
    // We update those so we don't end up being stuck with the saved setting it booted with.
    darkModeEnabled = settings.createLock().get(SCREEN_DARK_MODE_ENABLED);
    accentColorRGB = settings.createLock().get(ACCENT_COLOR);

    // Dark mode getter
    darkModeEnabled.onsuccess = function() {
      var result = darkModeEnabled.result[SCREEN_DARK_MODE_ENABLED];
      currentScheme = result ? 'dark' : 'light';

      if (previousScheme !== currentScheme) {
        document.querySelector(':root').dataset.theme = result ? 'dark' : 'light';
        document.body.classList.add('dom-transition-72pGvMgE');
        document.addEventListener('transitionend', function() {
          document.body.classList.remove('dom-transition-72pGvMgE');
        });
      }
      previousScheme = result ? 'dark' : 'light';
    };

    // Accent color getter
    accentColorRGB.onsuccess = function() {
      var result = accentColorRGB.result[ACCENT_COLOR];
      currentAccentColor = result;

      if (previousAccentColor !== currentAccentColor) {
        document.querySelector(':root').style.setProperty('--accent-color', result);
        document.body.classList.add('dom-transition-72pGvMgE');
        document.addEventListener('transitionend', function() {
          document.body.classList.remove('dom-transition-72pGvMgE');
        });
      }
      previousAccentColor = result;
    };
  }, 1000);
});
