!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getPowerManager();
    exports.PowermanagerService = service;
  } catch (e) {
    console.error(`PowermanagerService error: ${e}`);
  }
})(window);
