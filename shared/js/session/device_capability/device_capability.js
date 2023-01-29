!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('devicecapability');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var DeviceCapabilityManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_devicecapability.DeviceCapabilityManager.get(session).then((powerManagerService) => {
        DeviceCapabilityManager = powerManagerService;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing DeviceCapabilityManager: ", error);
  }

  exports.DeviceCapabilityManager = DeviceCapabilityManager;
})(window);
