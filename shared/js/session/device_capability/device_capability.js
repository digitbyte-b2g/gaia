!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getDeviceCapability();
    exports.DeviceCapabilityManager = service;
  } catch (e) {
    console.error(`DeviceCapabilityManager error: ${e}`);
  }
})(window);
