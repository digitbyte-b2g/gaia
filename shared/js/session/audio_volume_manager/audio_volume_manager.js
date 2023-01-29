!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('audiovolumemanager');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var AudioVolumeManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_audiovolume.AudioVolumeManager.get(session).then((powerManagerService) => {
        AudioVolumeManager = powerManagerService;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing AudioVolumeManager: ", error);
  }

  exports.AudioVolumeManager = AudioVolumeManager;
})(window);
