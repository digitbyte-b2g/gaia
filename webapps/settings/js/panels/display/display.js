/**
 * Handle display panel functionality, which will change the value of
 * screen.automatic-brightness of settings.
 *
 * @module display/display
 */
define(function(require) {
  'use strict';

  var SettingsListener = require('shared/settings_listener');
  var SliderHandler = require('panels/display/slider_handler');

  const AUTO_BRIGHTNESS_SETTING = 'screen.automatic-brightness';
  const SCREEN_BRIGHTNESS = 'screen.brightness';
  const UI_GFX_BLUR_RADIUS = 'ui.gfx.blur.radius';
  const UI_GFX_BLUR_OPACITY = 'ui.gfx.blur.opacity';
  const UI_PANEL_MARGIN = 'ui.panel.margin';
  const UI_PANEL_BORDER_RADIUS = 'ui.panel.border_radius';
  /**
   * @alias module:display/display
   * @class Display
   * @returns {Display}
   */
  var Display = function() {
    this.elements = null;
  };

  Display.prototype = {
    /**
     * Init Display module with doms and data of device-features.json.
     *
     * @access public
     * @memberOf Display.prototype
     * @param {HTMLElement} elements
     * @param {Object} data
     *                 content of resources/device-features.json.
     */
    init: function d_init(elements, data) {
      this.elements = elements;
      this.initBrightnessItems(data);
      SliderHandler().init(
        elements.brightnessManualInput,
        SCREEN_BRIGHTNESS);
      SliderHandler().init(
        elements.blurRadiusInput,
        UI_GFX_BLUR_RADIUS);
      SliderHandler().init(
        elements.blurOpacityInput,
        UI_GFX_BLUR_OPACITY);
      SliderHandler().init(
        elements.panelMarginInput,
        UI_PANEL_MARGIN);
      SliderHandler().init(
        elements.panelBorderRadiusInput,
        UI_PANEL_BORDER_RADIUS);
    },

    /**
     * Decide whether to show brightnessAuto and brightnessManual options.
     *
     * @access public
     * @memberOf Display.prototype
     * @param {Object} data
     *                 content of resources/device-features.json.
     */
    initBrightnessItems: function d_init_brightness_items(data) {
      var brightnessAuto = this.elements.brightnessAuto;
      var brightnessAutoCheckbox = this.elements.brightnessAutoCheckbox;
      var brightnessManual = this.elements.brightnessManual;
      var brightnessManualInput = this.elements.brightnessManualInput;
      var darkModeCheckbox = this.elements.darkModeCheckbox;

      if (data.ambientLight) {
        brightnessAuto.hidden = false;
        // Observe auto brightness setting
        SettingsListener.observe(AUTO_BRIGHTNESS_SETTING, false,
          function(value) {
            brightnessAutoCheckbox.checked = value;
            brightnessManual.hidden = value;
          }.bind(this));
      } else {
        brightnessAuto.hidden = true;
        brightnessManual.hidden = false;
        var cset = {};
        cset[AUTO_BRIGHTNESS_SETTING] = false;
        SettingsListener.getSettingsLock().set(cset);
      }
      // Observe screen brightness setting
      SettingsListener.observe(SCREEN_BRIGHTNESS, 0.5, function(value) {
        brightnessManualInput.value = value;
      }.bind(this));

      blurEnabled.addEventListener('change', function() {
        window.dispatchEvent(new CustomEvent('blurstatechange', {
          detail: blurEnabled.checked == 'on' ? 'enabled' : 'disabled' 
        }));
      });
    }
  };

  return function ctor_display() {
    return new Display();
  };
});
