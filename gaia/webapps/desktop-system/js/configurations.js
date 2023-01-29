(function(exports) {
  'use strict';

  var settings = SettingsObserver;
  const UI_GFX_BLUR_ENABLED = 'ui.gfx.blur.enabled';
  const UI_GFX_BLUR_RADIUS = 'ui.gfx.blur.radius';
  const UI_GFX_BLUR_OPACITY = 'ui.gfx.blur.opacity';
  const UI_LAYOUT_THICKNESS = 'ui.layout.thickness';
  const UI_PANEL_MARGIN = 'ui.panel.margin';
  const UI_PANEL_BORDER_RADIUS = 'ui.panel.border_radius';
  const UI_PANEL_ICON_POSITION = 'ui.panel.icon_position';
  var blurEnabled;
  var blurRadius;
  var blurOpacity;
  var layoutThickness;
  var panelMargin;
  var panelBorderRadius;
  var panelIconPosition;

  var screen = document.getElementById('screen');

  setInterval(function() {
    blurEnabled = settings.getValue(UI_GFX_BLUR_ENABLED);
    blurRadius = settings.getValue(UI_GFX_BLUR_RADIUS);
    blurOpacity = settings.getValue(UI_GFX_BLUR_OPACITY);
    layoutThickness = settings.getValue(UI_LAYOUT_THICKNESS);
    panelMargin = settings.getValue(UI_PANEL_MARGIN);
    panelBorderRadius = settings.getValue(UI_PANEL_BORDER_RADIUS);
    panelIconPosition = settings.getValue(UI_PANEL_ICON_POSITION);

    blurEnabled.onsuccess = function() {
      var result = blurEnabled.result[UI_GFX_BLUR_ENABLED];
      screen.dataset.gpuCapable = result;
    };

    blurRadius.onsuccess = function() {
      var result = blurRadius.result[UI_GFX_BLUR_RADIUS];
      screen.style.setProperty('--backdrop-blur-radius', result + 'px');
    };

    blurOpacity.onsuccess = function() {
      var result = blurOpacity.result[UI_GFX_BLUR_OPACITY];
      screen.style.setProperty('--backdrop-opacity', result);
    };

    layoutThickness.onsuccess = function() {
      var result = layoutThickness.result[UI_LAYOUT_THICKNESS];
      screen.dataset.thickness = result;
    };

    panelMargin.onsuccess = function() {
      var result = panelMargin.result[UI_PANEL_MARGIN];
      screen.style.setProperty('--panel-margin', result + 'px');

      panelBorderRadius.onsuccess = function() {
        var result1 = panelBorderRadius.result[UI_PANEL_BORDER_RADIUS];
        if (result !== 0) {
          screen.style.setProperty('--panel-border-radius', result1 + 'px');
        } else {
          screen.style.setProperty('--panel-border-radius', '0');
        }
      };
    };

    panelIconPosition.onsuccess = function() {
      var result = panelIconPosition.result[UI_PANEL_ICON_POSITION];
      if (result === 'center') {
        screen.classList.add('centered-alignment');
      } else {
        screen.classList.remove('centered-alignment');
      }
    };
  }, 1000);
})(window);