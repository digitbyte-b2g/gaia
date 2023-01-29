!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('time');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var TimeService = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_time.TimeService.get(session).then((timeManager) => {
        TimeService = timeManager;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing TimeService: ", error);
  }

  exports.TimeService = TimeService;
})(window);
