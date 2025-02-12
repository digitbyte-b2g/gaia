'use strict';

var StatusBar = require('./lib/statusbar');

marionette('Status Bar icons - Alarm', function() {

  var client = marionette.client({
    profile: {
      settings: {
        'alarm.enabled': true
      }
    }
  });

  var system;
  var statusBar;

  setup(function() {
    system = client.loader.getAppClass('system');
    system.waitForFullyLoaded();
    statusBar = new StatusBar(client);
  });

  test('should disappear when the alarm.enabled setting changes', function() {
    statusBar.alarm.waitForIconToAppear();

    client.executeScript(function() {
      window.wrappedJSObject.SettingsObserver.createLock().set({
        'alarm.enabled': false
      });
    });

    statusBar.alarm.waitForIconToDisappear();
  });
});
