!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getTelephonyManager();
    exports.TelephonyManager = service;
  } catch (e) {
    console.error(`TelephonyManager error: ${e}`);
  }
})(window);
