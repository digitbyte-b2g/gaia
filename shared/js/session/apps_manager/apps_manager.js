!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getAppsManager();
    exports.AppsManager = service;

    let apps = await service.getAll();
    console.log(apps);
  } catch (e) {
    console.error(`AppsManager error: ${e}`);
  }
})(window);
