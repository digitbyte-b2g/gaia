/* global MockGetDeviceStorage, MockGetDeviceStorages, MockDOMRequest */
'use strict';

require('/shared/test/unit/mocks/mock_event_target.js');
require('/shared/test/unit/mocks/mock_dom_request.js');
require('/shared/test/unit/mocks/mock_navigator_getdevicestorage.js');
require('/shared/test/unit/mocks/mock_navigator_getdevicestorages.js');

suite('MediaStorage > ', function() {
  var MediaStorage;
  var realDeviceStorage, realDeviceStorages;
  var modules = [
    'modules/media_storage'
  ];
  var map = {
    '*': {
      'shared/settings_listener': 'shared_mocks/mock_settings_listener'
    }
  };

  suiteSetup(function() {
    realDeviceStorages = navigator.b2g.getDeviceStorages;
    navigator.b2g.getDeviceStorages = MockGetDeviceStorages;

    realDeviceStorage = navigator.b2g.getDeviceStorage;
    navigator.b2g.getDeviceStorage = MockGetDeviceStorage;
  });

  suiteTeardown(function() {
    navigator.b2g.getDeviceStorages = realDeviceStorages;
    realDeviceStorages = null;

    navigator.b2g.getDeviceStorage = realDeviceStorage;
    realDeviceStorage = null;
  });

  setup(function(done) {
    var requireCtx = testRequire([], map, function() {});

    requireCtx(modules, function(media_storage) {
      MediaStorage = media_storage;
      done();
    });
  });

  suite('_updateMediaStorageInfo', function() {
    setup(function() {
      this.sinon.stub(MediaStorage, '_updateVolumeState');
    });

    test('when no _defaultMediaVolume',
      function() {
        MediaStorage._defaultMediaVolume = null;
        MediaStorage._updateMediaStorageInfo();
        assert.ok(MediaStorage._updateVolumeState.calledWith(null,
          'unavailable'));
    });

    test('when has _defaultMediaVolume', function() {
        MediaStorage._defaultMediaVolume = MockGetDeviceStorage();
        this.sinon.stub(MediaStorage._defaultMediaVolume, 'available')
          .returns(MockDOMRequest);
        MediaStorage._updateMediaStorageInfo();
        assert.ok(MediaStorage._defaultMediaVolume.available.called);
    });
  });

  suite('_getDefaultVolume', function() {
    setup(function() {
      this.sinon.spy(navigator, 'getDeviceStorages');
    });

    test('call navigator.b2g.getDeviceStorages to get default volume',
      function() {
        MediaStorage._getDefaultVolume();
        assert.ok(navigator.b2g.getDeviceStorages.calledWith('sdcard'));
    });
  });
});
