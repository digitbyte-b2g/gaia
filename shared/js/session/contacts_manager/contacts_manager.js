!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getContactsManager();
    exports.ContactsManager = service;
  } catch (e) {
    console.error(`ContactsManager error: ${e}`);
  }
})(window);
