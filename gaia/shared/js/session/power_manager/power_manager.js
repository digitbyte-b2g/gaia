!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('powermanager');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var PowerManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_powermanager.PowermanagerService.get(session).then((powerManagerService) => {
        PowerManager = powerManagerService;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing PowermanagerService: ", error);
  }

  exports.PowerManager = PowerManager;
})(window);
