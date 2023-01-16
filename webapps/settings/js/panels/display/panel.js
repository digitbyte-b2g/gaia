/**
 * The display panel allow user to modify timeout forscreen-off, brightness.
 */
define(function(require) {
  'use strict';

  var SettingsPanel = require('modules/settings_panel');
  var DisplayModule = require('panels/display/display');
  var LazyLoader = require('shared/lazy_loader');

  var displayElements = {};

  return function ctor_display_panel() {
    var display = DisplayModule();

    return SettingsPanel({
      onInit: function dp_onInit(panel) {
        displayElements = {
          brightnessManual: panel.querySelector('.brightness-manual'),
          brightnessManualInput:
            panel.querySelector('.brightness-manual input'),
          brightnessAuto: panel.querySelector('.brightness-auto'),
          brightnessAutoCheckbox:
            panel.querySelector('.brightness-auto gaia-checkbox'),
          blurEnabled: panel.querySelector('.blur-enabled'),
          blurEnabledCheckbox:
            panel.querySelector('.blur-enabled gaia-checkbox'),
          blurRadius: panel.querySelector('.blur-radius'),
          blurRadiusInput:
            panel.querySelector('.blur-radius input'),
          blurOpacity: panel.querySelector('.blur-opacity'),
          blurOpacityInput:
            panel.querySelector('.blur-opacity input'),
          layoutThickness: panel.querySelector('#layout-thickness'),
          layoutThicknessInput:
            panel.querySelector('#layout-thickness select'),
          panelMargin: panel.querySelector('.panel-margin'),
          panelMarginInput:
            panel.querySelector('.panel-margin input'),
          panelBorderRadius: panel.querySelector('.panel-border-radius'),
          panelBorderRadiusInput:
            panel.querySelector('.panel-border-radius input'),
          panelIconPosition: panel.querySelector('#panel-icon-position'),
          panelIconPositionInput:
            panel.querySelector('#panel-icon-position select')
        };

        LazyLoader.getJSON('/resources/device-features.json')
        .then(function(data) {
          display.init(displayElements, data);
        });
      }
    });
  };
});
