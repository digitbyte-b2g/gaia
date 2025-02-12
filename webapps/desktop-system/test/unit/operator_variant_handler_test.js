/* globals MockNavigatorMozIccManager, MockNavigatorMozMobileConnections,
           MockNavigatorSettings, MockNavigatorMozIccManager,
           OperatorVariantHandler */

'use strict';

require('/shared/js/lazy_loader.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_settings.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_icc_manager.js');
require('/shared/test/unit/mocks/mock_navigator_moz_mobile_connections.js');

require('/shared/js/operator_variant_helper.js');
require('/shared/js/apn_helper.js');
requireApp('system/js/operator_variant_handler.js');

suite('Operator variant', function() {
  const FAKE_ICC_ID = '8934071100276980483';
  const FAKE_ICC_CARD_INDEX = '0';
  const TEST_NETWORK_MCC = '001';

  const ORIGINAL_VOICEMAIL_NUMBER = '9999';
  const ORIGINAL_CB_SEARCH_LIST = '1,2,3,4';
  const FAKE_VOICEMAIL_NUMBER = '1234';
  const FAKE_CB_SEARCH_LIST = '5,6,7,8';

  const EXPECTED_MNC = '01';
  const EXPECTED_ICC_INFO = {
    mcc: TEST_NETWORK_MCC,
    mnc: EXPECTED_MNC
  };

  const EXPECTED_MNC2 = '03';
  const EXPECTED_ICC_INFO2 = {
    mcc: TEST_NETWORK_MCC,
    mnc: EXPECTED_MNC2
  };

  const T_MOBILE_US_MCC = '310';
  const T_MOBILE_160_US_MNC = '160';
  const T_MOBILE_200_US_MNC = '200';

  const T_MOBILE_160_US_ICC_INFO = {
    mcc: T_MOBILE_US_MCC,
    mnc: T_MOBILE_160_US_MNC
  };

  const T_MOBILE_200_US_ICC_INFO = {
    mcc: T_MOBILE_US_MCC,
    mnc: T_MOBILE_200_US_MNC
  };

  const NULL_ICC_INFO = { mcc: '000', mnc: '00' };

  const KEYS_VALUES = [
    { key: 'ril.data.carrier', value: 'Test Network' },
    { key: 'ril.data.apn', value: 'internet' },
    { key: 'ril.data.user', value: 'user' },
    { key: 'ril.data.passwd', value: 'password' },
    { key: 'ril.data.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.data.httpProxyPort', value: '8080' },
    { key: 'ril.data.authtype', value: 'none' },
    { key: 'ril.data.mtu', value: '1440' },
    { key: 'ril.supl.carrier', value: 'Test Network' },
    { key: 'ril.supl.apn', value: 'internet' },
    { key: 'ril.supl.user', value: 'user' },
    { key: 'ril.supl.passwd', value: 'password' },
    { key: 'ril.supl.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.supl.httpProxyPort', value: '8080' },
    { key: 'ril.supl.authtype', value: 'none' },
    { key: 'ril.supl.mtu', value: '1440' },
    { key: 'ril.dun.carrier', value: 'Test Network' },
    { key: 'ril.dun.apn', value: 'internet' },
    { key: 'ril.dun.user', value: 'user' },
    { key: 'ril.dun.passwd', value: 'password' },
    { key: 'ril.dun.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.dun.httpProxyPort', value: '8080' },
    { key: 'ril.dun.authtype', value: 'none' },
    { key: 'ril.dun.mtu', value: '1440' },
    { key: 'ril.ims.carrier', value: 'Test Network' },
    { key: 'ril.ims.apn', value: 'internet' },
    { key: 'ril.ims.user', value: 'user' },
    { key: 'ril.ims.passwd', value: 'password' },
    { key: 'ril.ims.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.ims.httpProxyPort', value: '8080' },
    { key: 'ril.ims.authtype', value: 'none' },
    { key: 'ril.ims.mtu', value: '1440' },
    { key: 'ril.fota.carrier', value: 'Test Network' },
    { key: 'ril.fota.apn', value: 'internet' },
    { key: 'ril.fota.user', value: 'user' },
    { key: 'ril.fota.passwd', value: 'password' },
    { key: 'ril.fota.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.fota.httpProxyPort', value: '8080' },
    { key: 'ril.fota.authtype', value: 'none' },
    { key: 'ril.fota.mtu', value: '1440' },
    { key: 'ril.mms.carrier', value: 'Test Network' },
    { key: 'ril.mms.apn', value: 'internet' },
    { key: 'ril.mms.mmsc', value: 'http://127.0.0.1' },
    { key: 'ril.mms.mmsproxy', value: '127.0.0.1' },
    { key: 'ril.mms.mmsport', value: '8080' },
    { key: 'ril.mms.mtu', value: '1440' },
    { key: 'ril.data.carrier', value: 'Test Network' },
    { key: 'ril.iccInfo.mbdn', value: [ORIGINAL_VOICEMAIL_NUMBER, ''] },
    { key: 'ril.cellbroadcast.searchlist', value: '0,1,2,3' }
  ];

  const KEYS_VALUES2 = [
    { key: 'ril.data.carrier', value: 'No type test' },
    { key: 'ril.data.apn', value: 'internet' },
    { key: 'ril.data.user', value: 'user' },
    { key: 'ril.data.passwd', value: 'password' },
    { key: 'ril.data.httpProxyHost', value: '127.0.0.1' },
    { key: 'ril.data.httpProxyPort', value: '8080' },
    { key: 'ril.data.authtype', value: 'none' },
    { key: 'ril.data.mtu', value: '1440' }
  ];

  var realMozSettings, realMozIccManager;

  var mozIcc;
  var mockManager = {
    mobileConnections: MockNavigatorMozMobileConnections,
    deviceInfoOs: 'fxos'
  };

  suiteSetup(function() {
    realMozSettings = SettingsObserver;
    SettingsObserver = MockNavigatorSettings;

    realMozIccManager = navigator.mozIccManager;
    navigator.mozIccManager = MockNavigatorMozIccManager;
  });

  suiteTeardown(function() {
    SettingsObserver = realMozSettings;
    navigator.mozIccManager = realMozIccManager;
  });

  setup(function() {
    // Ensure the default value for 'ril.iccInfo.mbdn'.
    MockNavigatorSettings.mSet({ 'ril.iccInfo.mbdn': ['', ''] });
    mozIcc = {
      'cardState': 'ready',
      matchMvno: function mi_matchMvno(mvnoType, matchData) {
        var req = {
          onsuccess: null,
          onerror: null,
          result: false
        };

        setTimeout(function() {
          if (req.onsuccess) {
            req.onsuccess();
          }
        });

        return req;
      }
    };
    MockNavigatorMozIccManager.addIcc(FAKE_ICC_ID, mozIcc);
    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).iccInfo =
      NULL_ICC_INFO;

    MockNavigatorMozMobileConnections[0].data = {
      type: 'gsm'
    };
  });

  teardown(function() {
    MockNavigatorSettings.mTeardown();
    MockNavigatorMozIccManager.mTeardown();
    MockNavigatorMozMobileConnections.mTeardown();
  });

  function setObservers(keyValues, observer, remove) {
    if (remove === undefined) {
      remove = false;
    }

    if (remove) {
      keyValues.forEach(function(data) {
        MockNavigatorSettings.removeObserver(data.key, this);
      }, observer.bound);
      observer.bound = null;
    }
    else {
      observer.bound = observer.func.bind(observer);
      keyValues.forEach(function(data) {
        MockNavigatorSettings.addObserver(data.key, this);
      }, observer.bound);
    }
  }

  test('Apply operator variant settings', function(done) {
    var observer = {
      bound: null,
      expected: KEYS_VALUES.length,
      seen: 0,
      func: function(event) {
        KEYS_VALUES.forEach(function(data) {
          if (data.key == event.settingName) {
            assert.equal(
              event.settingValue,
              data.value,
              'Wrong Data setting value'
            );
            ++this.seen;
          }
        }, this);

        if (this.seen == this.expected) {
          setObservers(KEYS_VALUES, this, true);
          done();
        }
      }
    };

    setObservers(KEYS_VALUES, observer);

    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).iccInfo =
      EXPECTED_ICC_INFO;
    var o = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
      mockManager);
    o.start();
  });

  test('Apply default operator variant for undefined types', function(done) {
    var observer = {
      bound: null,
      expected: KEYS_VALUES2.length,
      seen: 0,
      func: function(event) {
        KEYS_VALUES2.forEach(function(data) {
          if (data.key == event.settingName) {
            assert.equal(
              event.settingValue,
              data.value,
              'Wrong Data setting value'
            );
            ++this.seen;
          }
        }, this);

        if (this.seen == this.expected) {
          setObservers(KEYS_VALUES2, this, true);
          done();
        }
      }
    };

    setObservers(KEYS_VALUES2, observer);

    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).iccInfo =
      EXPECTED_ICC_INFO2;

    var o = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
      mockManager);
    o.start();
  });

  test('operator variant apply once per boot', function() {
    var observer = {
      bound: null,
      hasApplied: false,
      func: function(event) {
        if (event.settingName == 'ril.data.carrier') {
          assert.false(
            this.hasApplied,
            'Settings should *not* be applied twice!'
          );

          assert.match(
            event.settingValue,
            /^T-Mobile US/,
            'Expected network name to contain "T-Mobile US"'
          );

          this.hasApplied = true;
        }
      }
    };

    observer.bound = observer.func.bind(observer);
    MockNavigatorSettings.addObserver('ril.data.carrier', observer.bound);

    // Testing apply once per boot requires *real* mcc/mnc information.
    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).iccInfo =
      T_MOBILE_160_US_ICC_INFO;

    var o = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
      mockManager);
    o.start();
    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).triggerEventListeners(
      'iccinfochange', {}
    );

    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).iccInfo =
      T_MOBILE_200_US_ICC_INFO;
    MockNavigatorMozIccManager.getIccById(FAKE_ICC_ID).triggerEventListeners(
      'iccinfochange', {}
    );
  });

  test('APN filtering', function(done) {
    var ovh = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX, 
      mockManager);

    /* Inject some dummy MCC & MNC values corresponding to the test APNs, look
     * into shared/resources/apn.json for the corresponding values */
    ovh._iccSettings = { mcc: '001', mnc: '02' };

    MockNavigatorMozMobileConnections[0].data.type = 'gsm';
    ovh.retrieveOperatorVariantSettings(function(list) {
      assert.equal(list.length, 2);
      assert.isTrue(list.some(function(element) {
        return (element.carrier === 'NoBearer');
      }));
      assert.isTrue(list.some(function(element) {
        return (element.carrier === 'ZeroBearer');
      }));

      MockNavigatorMozMobileConnections[0].data.type = 'evdo0';
        ovh.retrieveOperatorVariantSettings(function(list) {
        assert.equal(list.length, 3);
        assert.isTrue(list.some(function(element) {
          return (element.carrier === 'NoBearer');
        }));
        assert.isTrue(list.some(function(element) {
          return (element.carrier === 'ZeroBearer');
        }));
        assert.isTrue(list.some(function(element) {
          return (element.carrier === 'Evdo0Bearer');
        }));

        done();
      });
    });
  });

  suite('updateOperatorVariantSettings', function() {
    suiteSetup(function() {
      this.clock = sinon.useFakeTimers();
    });

    suiteTeardown(function() {
      this.clock.restore();
    });

    setup(function() {
      this.ovh = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
        mockManager);
      this.ovh._iccCardIndex = 1;
    });

    teardown(function() {
      MockNavigatorSettings.mTeardown();
    });

    test('should update the voicemail number', function() {
      MockNavigatorSettings.mSet({
        'ril.iccInfo.mbdn': ['', ORIGINAL_VOICEMAIL_NUMBER]
      });
      this.ovh.updateOperatorVariantSettings(
        'ril.iccInfo.mbdn', FAKE_VOICEMAIL_NUMBER);
      this.clock.tick(1000);
      assert.deepEqual(
        MockNavigatorSettings.mSettings['ril.iccInfo.mbdn'],
        ['', FAKE_VOICEMAIL_NUMBER]
      );
    });

    test('should update the search list', function() {
      MockNavigatorSettings.mSet({
        'ril.cellbroadcast.searchlist': ['', ORIGINAL_CB_SEARCH_LIST]
      });
      this.ovh.updateOperatorVariantSettings(
        'ril.cellbroadcast.searchlist', FAKE_CB_SEARCH_LIST);
      this.clock.tick(1000);
      assert.deepEqual(
        MockNavigatorSettings.mSettings['ril.cellbroadcast.searchlist'],
        ['', FAKE_CB_SEARCH_LIST]
      );
    });
  });

  suite('getValueFromOperatorVariantSettings', function() {
    setup(function() {
      this.ovh = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
        mockManager);
    });

    test('with specified operator variant value', function() {
      this.allSettings = [{
        'type': 'operatorvariant',
        'voicemail': FAKE_VOICEMAIL_NUMBER,
        'cellBroadcastSearchList': FAKE_CB_SEARCH_LIST
      }];
      var number =
        this.ovh.getValueFromOperatorVariantSettings(this.allSettings,
          'voicemail');
      var searchList =
        this.ovh.getValueFromOperatorVariantSettings(this.allSettings,
          'cellBroadcastSearchList');
      assert.equal(number, FAKE_VOICEMAIL_NUMBER);
      assert.equal(searchList, FAKE_CB_SEARCH_LIST);
    });

    test('without specified operator variant value', function() {
      this.allSettings = [];
      var number =
        this.ovh.getValueFromOperatorVariantSettings(this.allSettings,
          'FakeVariantType');
      assert.equal(number, '');
    });
  });

  suite('mergeAndKeepCustomApnSettings', function() {
    var defaultApns = [{
      carrier: 'carrier',
      types: ['default', 'supl'],
      password: 'newPw'
    }];

    setup(function() {
      this.ovh = new OperatorVariantHandler(FAKE_ICC_ID, FAKE_ICC_CARD_INDEX,
        mockManager);
    });

    test('with operator variant voicemail number', function() {
      // Mock existing apns in apn.data.settings
      var existingApns = [{
        carrier: '_custom_',
        types: ['default'],
        password: 'originalPw'
      }, {
        carrier: 'carrier',
        types: ['supl'],
        password: 'originalPw'
      }];

      // The expeced merging result. Note that the default apns does not
      // override the custom setting with the same type.
      var expectedApns = [{
        carrier: 'carrier',
        types: ['supl'],
        password: 'newPw'
      }, {
        carrier: '_custom_',
        types: ['default'],
        password: 'originalPw'
      }];

      var mergedApns =
        this.ovh.mergeAndKeepCustomApnSettings(existingApns, defaultApns);
      assert.deepEqual(mergedApns, expectedApns);
    });

    test('custom apns array is undefined', function() {
      var mergedApns = this.ovh.mergeAndKeepCustomApnSettings(undefined,
                                                              defaultApns);
      assert.deepEqual(mergedApns, defaultApns);
    });
  });
});
