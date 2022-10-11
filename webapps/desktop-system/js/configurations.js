(function(exports) {
  'use strict';

  var settings = navigator.mozSettings;
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

  var root = document.querySelector(':root');

  setInterval(function() {
    blurEnabled = settings.createLock().get(UI_GFX_BLUR_ENABLED);
    blurRadius = settings.createLock().get(UI_GFX_BLUR_RADIUS);
    blurOpacity = settings.createLock().get(UI_GFX_BLUR_OPACITY);
    layoutThickness = settings.createLock().get(UI_LAYOUT_THICKNESS);
    panelMargin = settings.createLock().get(UI_PANEL_MARGIN);
    panelBorderRadius = settings.createLock().get(UI_PANEL_BORDER_RADIUS);
    panelIconPosition = settings.createLock().get(UI_PANEL_ICON_POSITION);

    blurEnabled.onsuccess = function() {
      var result = blurEnabled.result[UI_GFX_BLUR_ENABLED];
      root.dataset.gpuCapable = result;
    };
    blurRadius.onsuccess = function() {
      var result = blurRadius.result[UI_GFX_BLUR_RADIUS];
      root.style.setProperty('--blur-radius', result + 'px');
    };
    blurOpacity.onsuccess = function() {
      var result = blurOpacity.result[UI_GFX_BLUR_OPACITY];
      root.style.setProperty('--blur-opacity', result);
    };
    layoutThickness.onsuccess = function() {
      var result = layoutThickness.result[UI_LAYOUT_THICKNESS];
      root.dataset.thickness = result;
    };
    panelMargin.onsuccess = function() {
      var result = panelMargin.result[UI_PANEL_MARGIN];
      root.style.setProperty('--panel-margin', result + 'px');

      panelBorderRadius.onsuccess = function() {
        var result1 = panelBorderRadius.result[UI_PANEL_BORDER_RADIUS];
        if (result !== 0) {
          root.style.setProperty('--panel-border-radius', result + 'px');
        } else {
          root.style.setProperty('--panel-border-radius', '0');
        }
      };
    };
    panelIconPosition.onsuccess = function() {
      var result = layoutThickness.result[UI_PANEL_ICON_POSITION];
      document.getElementById('software-buttons').classList.toggle('centered', result === 'center');
    };
  }, 1000);
})(window);