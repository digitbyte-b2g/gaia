!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getTimeService();
    exports.TimeService = service;
  } catch (e) {
    console.error(`TimeService error: ${e}`);
  }
})(window);
