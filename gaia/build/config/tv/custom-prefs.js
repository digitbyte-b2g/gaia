/*global user_pref*/
user_pref('devtools.responsiveUI.customWidth', 1366);
user_pref('devtools.responsiveUI.customHeight', 768);
user_pref('devtools.responsiveUI.currentPreset', 'custom');
user_pref('b2g.system_startup_url',
          'http://smart-system.gaiamobile.org/index.html');
user_pref('b2g.system_manifest_url',
          'http://smart-system.gaiamobile.org/manifest.webmanifest');
user_pref('b2g.neterror.url',
          'http://smart-system.gaiamobile.org/net_error.html');

// Collaborate with meta-viewport to fulfill more complete web experience
user_pref('apz.allow_zooming', true);
// Larger value to provide better experience for webapps/pages which targets on
// TV but uses embed tag with hard-coded width/height
user_pref('browser.viewport.desktopWidth', 1280);

user_pref('dom.presentation.enabled', true);
user_pref('devtools.useragent.device_type', 'TV');
user_pref('dom.apps.customization.enabled', false);

//network offline error
user_pref('network.offline-mirrors-connectivity', true);
