!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getProcManager();
    exports.ProcManager = service;
  } catch (e) {
    console.error(`ProcManager error: ${e}`);
  }
})(window);
