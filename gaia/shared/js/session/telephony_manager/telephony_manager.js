!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('telephony');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var TelephonyManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_telephony.Telephony.get(session).then((telephonyManager) => {
        TelephonyManager = telephonyManager;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing TelephonyManager: ", error);
  }

  exports.TelephonyManager = TelephonyManager;
})(window);
