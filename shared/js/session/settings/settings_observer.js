!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('settings');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var SettingsObserver = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_settings.SettingsManager.get(session).then((settingsManager) => {
        SettingsObserver = settingsManager;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing SettingsManager: ", error);
  }

  exports.SettingsObserver = SettingsObserver;
})(window);
