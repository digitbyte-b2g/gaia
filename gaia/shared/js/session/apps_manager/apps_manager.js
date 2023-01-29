!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('apps');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var AppsManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_apps.AppsManager.get(session).then((appsManager) => {
        AppsManager = appsManager;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing AppManager: ", error);
  }

  exports.AppsManager = AppsManager;
})(window);
