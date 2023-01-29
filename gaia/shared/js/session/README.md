## HTML:

```html
    <script defer src="%SHARED_APP_ORIGIN%/js/utils/common/lazy_loader.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/task_scheduler.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/lib_session.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/settings/settings_observer.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/device_capability/device_capability.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/power_manager/power_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/telephony_manager/telephony_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/account_manager/account_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/apps_manager/apps_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/contacts_manager/contacts_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/audio_volume_manager/audio_volume_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/process_manager/process_manager.js"></script>
    <script defer src="%SHARED_APP_ORIGIN%/js/session/time_service/time_service.js"></script>
```

## SessionInit

```javascript
const servicesArray = [
  'settingsService',
  'powerService',
  'appsService',
  'tcpsocketService',
  'telephonyService',
  'devicecapabilityService',
  'accountsService',
  'appsService',
  'contactsService',
  'audiovolumeService',
  'procmanagerService',
  'timeService',
  'fotaService'
];

/* Session init */
window.libSession.initService(servicesArray).then(()=>{
  ....
});
```

## SettingsObserver sample code

```javascript
// get settings value
SettingsObserver.getValue('settings.test').then((value) => {
  console.log('settings.test value is ' + value);
});

// get multi settings value
// notes: settings key doesn't exist, result doesn't contain relate value.
SettingsObserver.getBatch([name1, name2]).then((result) => {
  // result format is
  //  [{ name: name1, value: value1 },
  //   { name: name2, value: value2 }]
});

// set one settings value
SettingsObserver.setValue([{
  name: 'settings.test',
  value: 'test'
}]).then(resolve, reject);

// set multi settings value
SettingsObserver.setValue([{
  name: 'settings.test',
  value: 'test'
}, {
  name: 'settings.test',
  value: 'test0'
}]);

const observeHandle = (value, name) => {
  console.log(name + ' value is ' + value);
};

// get and observe settings change
SettingsObserver.observe('settings.test', defaultValue, observeHandle);
// unobserve settings change
SettingsObserver.unobserve('wifi.enabled', observeHandle);
```

## DeviceCapabilityManager sample code

```javascript
// get device capability
DeviceCapabilityManager.get('hardware.memory').then((value) => {
  console.log('hardware memory is ' + value);
})

/* PowerManager sample code */
// sync functions
PowerManager.powerOff();
PowerManager.reboot();
PowerManager.setFactoryReset(reason);
PowerManager.setScreenEnabled(true);
...

// async functions
PowerManager.getFactoryResetReason().then((value) => {
  console.log('factory reset reason is ' + value);
})

PowerManager.getScreenEnabled().then((value) => {
  console.log('screen enabled ? ' + value);
})
...
```

## TelephonyManager sample code

```javascript
// set call state
TelephonyManager.setCallState(state);
// get call state
// idle: 0; ringing: 1; offhook: 2
TelephonyManager.getCallState().then((value) => {
  console.log('call state is ' + value);
})

// add callstate_change listener
const callback = (value) => {
  console.log('call state changed to ' + value);
}
TelephonyManager.observeCallStateChange(callback);
// remove callstate_change listener
TelephonyManager.unobserveCallStateChange(callback);
```

## AccountManager sample code

First, please add the according permissions as you need into manifest.webapp/manifest.webmanifest.
``` json
"permissions": {
  "account-observer-activesync": { },
  "account-observer-google": { },
  "account-observer-kaiaccount": { }
}
```

``` javascript
const callback = (data) => {
  /**
   * authenticatorId:
   *  1. google
   *  2. activesync
   *  3. kaiaccount
   *
   * state:
   *  - LOGGED_IN: 0
   *  - LOGGED_OUT: 1
   *  - REFRESHED: 2
   */
  const { authenticatorId, accountId, state } = data;

  console.log(`The state of ${authenticatorId} has been changed to ${state}.`);
  // Note: accountId would be supported after api-daemon update.
  console.log(`Account ID is ${accountId}.`);
}

// To observe exchange account status change and run callback function you defined.
AccountManager.observe('activesync', callback);
// To observe google account status change and run callback function you defined.
AccountManager.observe('google', callback);
// To observe KaiOS account status change and run callback function you defined.
AccountManager.observe('kaiaccount', callback);

```

## AppsManager sample code

```javascript
//APIs
// Get all apps
AppsManager.getAll().then((apps) => {
  apps.forEach((app) => {
    console.log('app:' + JSON.stringify(app));
  }) ;
}, (err) => {
  console.log('err:' +  err); // should be member of AppsManager.AppsServiceError
});

// Get app object
const manifestUrl = 'https://calculator.local/manifest.webapp';
AppsManager.getApp(manifestUrl).then((app) => {
  console.log('app:' + JSON.stringify(app));
}, (err) => {
  console.log('err:' +  err);
});

// Get the runtime state for the appservice
AppsManager.getState().then((state) => {
  console.log('state:' + state); // should be member of AppsManager.AppsServiceState
}, (err) => {
  console.log('err:' +  err);
});

// checkForUpdate
const url = 'https://api.kaiostech.com/apps/manifest/RZzvAt4g1Je76j4CycaM';
AppsManager.checkForUpdate(url).then((result) => {
  console.log('result:' + result); // bool
}, (err) => {
  console.log('err:' +  err);
});

// Install an app
const manifestUrl = 'https://api.kaiostech.com/apps/manifest/RZzvAt4g1Je76j4CycaM';
AppsManager.installPackage(manifestUrl).then((app) => {
  console.log('app:' + JSON.stringify(app));
}, (err) => {
  console.log('err:' +  err);
});

// Install an app
const manifestUrl = 'https://testpwa.github.io/manifest.webmanifest';
AppsManager.installPwa(manifestUrl).then((app) => {
  console.log('app:' + JSON.stringify(app));
}, (err) => {
  console.log('err:' +  err);
});


const manifestUrl = 'http://ciautotest.localhost:8081/manifest.webmanifest';
const status = AppsManager.AppsStatus.ENABLED;
AppsManager.setEnabled(manifestUrl, status).then((app) => {
   console.log('app:' + JSON.stringify(app));
}, (err) => {
   console.log('err:' + err);
});

const manifestUrl = 'http://ciautotest.localhost:8081/manifest.webmanifest';
const type = AppsManager.ClearType.BROWSER;
AppsManager.clear(manifestUrl, type).then((result) => {
   console.log('result:' + result); // bool
}, (err) => {
   console.log('err:' + err);
});

// Get auto update policy
AppsManager.getUpdatePolicy().then((policy) => {
  console.log('update policy:' + policy);
}, (err) => {
  console.log('err:' + err);
});

// Set auto update policy
const updatePolicyConfig = {
  enabled: true,
  connType: AppsManager.ConnectionType.WI_FI_ONLY,
  delay: 86400; // 1 day
}
AppsManager.setUpdatePolicy(updatePolicyConfig).then((result) => {
  console.log('result:' + result); // bool
}, (err) => {
  console.log('err:' + err);
});

// Uninstall an app
const manifestUrl = 'https://ciautotest.local/manifest.webapp';
AppsManager.uninstall(manifestUrl).then((url) => {
  console.log('url:' + url);
}, (err) => {
  console.log('err:' +  err);
});

// Update an app
const manifestUrl = 'https://ciautotest.local/manifest.webapp';
AppsManager.update(manifestUrl).then((app) => {
  console.log('app:' + JSON.stringify(app));
}, (err) => {
  console.log('err:' +  err);
});

// Cancel app download process.
const updateUrl = 'https://api.kaiostech.com/apps/manifest/RZzvAt4g1Je76j4CycaM';
AppsManager.cancelDownload(updateUrl).then((appsObject, appsServiceError) => {
  console.log('appsObject:' + JSON.stringify(appsObject), 'appsServiceError:', appsServiceError);
}, (err) => {
  console.log('err:' +  err);
});

//Event
"update": Report the app object which is updated successfully
"install": Report the app object which is installed successfully
"uninstall": Report the manifest URL which is uninstalled successfully.

const callback = (value) => {
  console.log('value:' + value);
};
const event = 'update';
AppsManager.addEventListener(event, callback);
AppsManager.removeEventListener(event, callback);
```

## AudioVolumeManager sample code
```javascript
//request volume up
AudioVolumeManager.requestVolumeUp().then(() => {
  console.log('success');
});

//request volume down
AudioVolumeManager.requestVolumeDown().then(() => {
  console.log('success');
});

//request volume show
AudioVolumeManager.requestVolumeShow().then(() => {
  console.log('success');
});

// Events: AUDIO_VOLUME_CHANGED_EVENT
// AudioVolumeState enumeration: {
// NONE
// VOLUME_UP
// VOLUME_DOWN
// VOLUME_SHOW
// }
// Observe AUDIO_VOLUME_CHANGED_EVENT
// state:
//   AudioVolumeManager.AudioVolumeState.VOLUME_UP
//   AudioVolumeManager.AudioVolumeState.VOLUME_DOWN
//   AudioVolumeManager.AudioVolumeState.VOLUME_SHOW
const callback = (state) => {
  console.log('audio volume state changed to ' + state);
}
AudioVolumeManager.observeAudioVolumeChanged(callback);
// unobserve AUDIO_VOLUME_CHANGED_EVENT
AudioVolumeManager.unobserveAudioVolumeChanged(callback);
```

## ContactsManager sample code
```javascript
// All constant in ContactsManger
{
   ChangeReason: {
    CREATE: 0,
    UPDATE: 1,
    REMOVE: 2
  },

  FilterByOption: {
    NAME: 0,
    GIVEN_NAME: 1,
    FAMILY_NAME: 2,
    TEL: 3,
    EMAIL: 4,
    CATEGORY: 5
  },

  FilterOption: {
    EQUALS: 0,
    CONTAINS: 1,
    MATCH: 2,
    STARTS_WITH: 3,
    FUZZY_MATCH: 4
  },

  Order: {
    ASCENDING: 0,
    DESCENDING: 1
  },

  SortOption: {
    GIVEN_NAME: 0,
    FAMILY_NAME: 1,
    NAME: 2
  }
};

const speedDialChanged = (evt) => {
  const SpeedDialInfo = {
    dialKey: '1', // {String}
    tel: '123', // {String}
    contactId: 'id', // {String}
  };
  console.log('speed dial change: ' + evt.reason, evt.speeddial: SpeedDialInfo);
};
const blockNumberChanged = (evt) => {
  console.log('block number change: ' + evt.reason, evt.number);
};
const groupChanged = (evt) => {
  console.log('group change : ' + evt.reason, evt.id, evt.name);
};
const contactChanged = (evt) => {
  console.log('contact change : ' + evt.reason);
  const contact = evt.contacts;
  switch(evt.reason) {
    case ContactsManager.ChangeReason.CREATE:
      console.log('contact create', contact)
    case ContactsManager.ChangeReason.UPDATE:
      console.log('contact update', contact)
    case ContactsManager.ChangeReason.DELETE:
      console.log('contact delete', contact)
  }
};

ContactsManager.addEventListener(ContactsManager.EventMap.SPEED_DIAL_CHANGE, speedDialChanged);

ContactsManager.addEventListener(ContactsManager.EventMap.BLOCKED_NUMBER_CHANGE, blockNumberChanged);

ContactsManager.addEventListener(ContactsManager.EventMap.GROUP_CHANGE, groupChanged);

ContactsManager.addEventListener(ContactsManager.EventMap.CONTACT_CHANGE, contactChange);

// contacts group
ContactsManager.getAllGroups().then((group) => {
  if (group.length < 1) {
    ContactsManager.saveGroup(true, {name: 'test'}).then(() => {
      console.log('Add group success!');
    }, (err) => {
      console.log('Add group error: ' + err.reason);
    });
  } else {
    let g = group[0];
    g.name = 'test111222';
    ContactsManager.saveGroup(false, g).then(() => {
      console.log('Update group success !');
      ContactsManager.removeGroup(g.id).then(() => {
        console.log('Remove group success!');
      });
      ContactsManager.getContactIdsFromGroup(g.id).then((ids = []) => {
        console.log('get group contacts success!', ids)
      });
    });
  }
});

// speed dials
ContactsManager.getSpeedDials().then((speedDials) => {
  if (speedDials.length < 1) {
    ContactsManager.setSpeedDial(true, {
      dialKey: '1',
      tel: '123456',
      contactId: '123456789'
    }).then(() => {
      console.log('Set speed dial success!');
    }, (err) => {
      console.log('Set speed dial error: ' + err.reason);
    });
  } else {
    let s = speedDials[0];
    s.tel = '111111';
    ContactsManager.setSpeedDial(false, s).then(() => {
      console.log('Update speed dial success !');
      ContactsManager.removeSpeedDial(s.dialKey).then(() => {
        console.log('Remove speed dial success!');
      });
    });
  }
});


// ICE contacts
ContactsManager.getAllICE().then((ICES) => {
  if (ICES.length > 0) {
    let s = ICES[0];
    s.contactId = '111111';
    s.position = 2; // position start with 1.
    ContactsManager.setICE(s.contactId, s.position).then(() => {
      console.log('Update ice success !');
      ContactsManager.removeICE(s.contactId).then(() => {
        console.log('Remove ice success!');
      });
    });
  }
});

// block contacts
ContactsManager.getAllBlockedNumbers().then((blockNumbers) => {
  if (blockNumbers.length < 1) {
    ContactsManager.addBlockedNumber('123456').then(() => {
      console.log('Add block number success!');
      ContactsManager.addBlockedNumber('111111');
    }, (err) => {
      console.log('Add block number error: ' + err.reason);
    });
  } else {
    const bOption = {
      filterValue: '123',
      filterOption: ContactsManager.filterOption.EQUALS
    };
    ContactsManager.findBlockedNumbers(bOption).then((result) => {
      console.log('Find block number success : ' + result);
      ContactsManager.removeBlockedNumber(blockNumbers[0]).then(() => {
        console.log('Remove block number success!');
      });
    });
  }
});

// get all contacts
const options = {
      sortBy: ContactsManager.SortOption.FAMILY_NAME
      sortOrder: ContactsManager.Order.ASCENDING,
      sortLanguage: navigator.language,
    };
/**
 * @param options: ContactSortOptions
 * @param numbers: only return numbers of contacts after every cursor.next()
 * @param onlyMainData: only return main table data, would be faster but less info.
 * @return dom cursor, if done, must release the cursor by cursor.release().
*/
ContactsManager.getAll(options, 1, false).then(cursor => {
  const fetchData = () => {
    cursor
      .next()
      .then(contacts => {
        this._contacts = this._contacts.concat(contacts);
        console.log('fetching');
        fetchData();
      })
      .catch(error => {
        cursor.release();
        console.log('All contacts fetched:', this._contacts);
      });

      ContactsManager.save(true ,this._contacts[0]).then(() => {
        console.log('contact saved');
      })

      ContactsManager.save(false ,this._contacts[0]).then(() => {
        console.log('contact updated');
      })

      ContactsManager.remove(this._contacts[0].map(c => c.id)).then(() => {
        console.log('contacts deleted');
      })

      ContactsManager.clear().then(() => {
        console.log('all contacts clear');
      })

      ContactsManager.getCount().then((number) => {
        console.log('All contacts total is: ' + number);
      })
  };
  fetchData();
});

// find
/* ContactFindSortOptions = {
   *    sortBy：// ContactsManager.SortOption
   *    sortOrder// ContactsManager.Order
   *    sortLanguage: eg: navigator.language || 'de'
   *    filterValue: // e.g. "Tom" "123456"
   *    filterOption: // [ContactsManager.FilterOption.xxx, ...]
   *    filterBy: // ContactsManager.FilterByOption.xxx
   *    onlyMainData: {bool} Only return the main data of a contact or not.
   *  }
   * @param numbers: only return numbers of contacts after every cursor.next()
   * @return dom cursor if done, must release the cursor by cursor.release().
*/
ContactsManager.find(options, 1).then(cursor => {
  const fetchData = () => {
    cursor
      .next()
      .then(contacts => {
        this._contacts = this._contacts.concat(contacts);
        console.log('fetching');
        fetchData();
      })
      .catch(error => {
        cursor.release();
        console.log('All contacts find', this._contacts);
      });
  };
  fetchData();
})

 /** getContactByID
   * @param id: contact id
   * @param onlyMainData: only return main table data, would be faster but less info.
   * @return promise.
   */
ContactsManager.getContactByID(id, onlyMainData).then((contact) => {
  console.log('get contact info', contacts)
})
```

## ProcManager sample code
```javascript
ProcManager.begin("test").then(ok => {
  console.log("begin");
  return ProcManager.add(123, lib_procmanager.GroupType.FOREGROUND);
}).then(ok => {
  console.log("add");
  return ProcManager.commit();
}).then(ok => {
  console.log("commit");
});

ProcManager.begin("test").then(ok => {
  console.log("begin");
  return ProcManager.reset();
}).then(ok => {
  console.log("reset");
  return ProcManager.commit();
}).then(ok => {
  console.log("commit");
});
```

## TimeService sample code
```javascript
TimeService.set(new Date()).then(() => {
  console.log('time set success');
});
TimeService.get().then(value => {
  console.log(value);
});

const timeChangeCallback = () => {
  console.log('Time changed.');
}
const timeEvent = 'timeChange';
TimeService.addEventListener(timeEvent, timeChangeCallback);
TimeService.removeEventListener(timeEvent, timeChangeCallback);
```
