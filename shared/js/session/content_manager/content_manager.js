!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getContentManager();
    exports.ContentManager = service;
  } catch (e) {
    console.error(`ContentManager error: ${e}`);
  }
})(window);
