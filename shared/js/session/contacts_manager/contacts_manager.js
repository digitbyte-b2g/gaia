!(function (exports) {
  'use strict';

  if (ApiDaemon) {
    ApiDaemon.loadService('contacts');
  } else {
    console.error('Session Error: AppManager dosen\'t exist or is malfunctioning...');
  }

  var ContactsManager = null;
  try {
    const session = new lib_session.Session();
    const sessionState = {};
    sessionState.onsessionconnected = () => {
      lib_contacts.ContactsManager.get(session).then((powerManagerService) => {
        ContactsManager = powerManagerService;
      });
    };
    session.open("websocket", "localhost", "secrettoken", sessionState, true);
  } catch (error) {
    console.error("Error initializing ContactsManager: ", error);
  }

  exports.ContactsManager = ContactsManager;
})(window);
