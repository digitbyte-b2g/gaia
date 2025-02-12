'use strict';
/* global CellBroadcastSystem, MocksHelper, MockNavigatorMozMobileConnections,
          CarrierInfoNotifier
 */

requireApp('system/js/carrier_info_notifier.js');
requireApp('system/js/cell_broadcast_system.js');
require('/shared/test/unit/mocks/mock_navigator_moz_mobile_connections.js');
require('/shared/js/intl/l20n.js');

var mocksForCBS = new MocksHelper([
  'NavigatorMozMobileConnections'
]).init();

suite('system/CellBroadcastSystem', function() {

  var subject;
  var realMozMobileConnections;

  mocksForCBS.attachTestHelpers();

  suiteSetup(function() {
    realMozMobileConnections = navigator.b2g.mobileConnections;
    navigator.b2g.mobileConnections = MockNavigatorMozMobileConnections;
  });

  suiteTeardown(function() {
    navigator.b2g.mobileConnections = realMozMobileConnections;
  });

  setup(function() {
    subject = new CellBroadcastSystem();
  });

  suite('settingsChangedHandler', function() {
    test('dispatches cellbroadcastmsgchanged event', function(done) {
      window.addEventListener('cellbroadcastmsgchanged', function cb() {
        window.removeEventListener('cellbroadcastmsgchanged', cb);
        done();
      });
      subject.settingsChangedHandler({
        settingValue: [true, true]
      });
    });
  });

  suite('show', function() {
    var realMobileOperator;
    var fakeMessageID = 0;
    var fakeMcc = [123, 456];

    setup(function() {
      this.sinon.stub(CarrierInfoNotifier, 'show');
      this.sinon.stub(window, 'dispatchEvent');
      [0, 1].forEach((id) => {
        var conn = new window.MockMobileconnection();
        conn.voice = {
          network: {
            mcc: fakeMcc[id]
          }
        };

        window.navigator.b2g.mobileConnections.mAddMobileConnection(conn, id);
      });

      realMobileOperator = window.MobileOperator;
      window.MobileOperator = {
        BRAZIL_MCC:
          window.navigator.b2g.mobileConnections[0].voice.network.mcc,
        BRAZIL_CELLBROADCAST_CHANNEL: fakeMessageID
      };
    });

    teardown(function() {
      window.MobileOperator = realMobileOperator;
    });

    test('if SIM1 is Brazil mcc, will send out event', function(done) {
      subject.show({
        message: {
          messageId: fakeMessageID,
          cdmaServiceCategory: null,
          body: {},
          serviceId: 0
        }
      }).then(() => {
        sinon.assert.called(window.dispatchEvent);
        sinon.assert.notCalled(CarrierInfoNotifier.show);
      }).then(done, done);
    });

    test('if SIM 2 is not Brazil mcc, will not send out event', function(done) {
      subject.show({
        message: {
          messageId: fakeMessageID,
          cdmaServiceCategory: null,
          body: {},
          serviceId: 1
        }
      }).then(() => {
        sinon.assert.notCalled(window.dispatchEvent);
        sinon.assert.called(CarrierInfoNotifier.show);
      }).then(done, done);
    });

    test('return while message is GSM CMAS', function(done) {
      subject.show({
        message: {
          messageId: 4370,
          cdmaServiceCategory: null,
          body: {}
        },
        serviceId: 0,
      }).then(() => {
        sinon.assert.notCalled(CarrierInfoNotifier.show);
      }).then(done, done);
    });

    test('return while message is CDMA CMAS', function(done) {
      subject.show({
        message: {
          messageId: 0,
          cdmaServiceCategory: 4096,
          body: {}
        },
        serviceId: 0,
      }).then(() => {
        sinon.assert.notCalled(CarrierInfoNotifier.show);
      }).then(done, done);
    });
  });

  suite('_hasCBSDisabled', function() {
    suite('with any disabled CBS item', function() {
      setup(function() {
        subject._settingsDisabled = [true, false];
      });

      test('we would get true', function() {
        assert.isTrue(subject._hasCBSDisabled());
      });
    });

    suite('without any disabled CBS item', function() {
      setup(function() {
        subject._settingsDisabled = [false, false];
      });

      test('we would get false', function() {
        assert.isFalse(subject._hasCBSDisabled());
      });
    });
  });
});
