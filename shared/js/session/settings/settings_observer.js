!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getSettings();
    exports.SettingsObserver = service;
  } catch (e) {
    console.error(`SettingsObserver error: ${e}`);
  }
})(window);
