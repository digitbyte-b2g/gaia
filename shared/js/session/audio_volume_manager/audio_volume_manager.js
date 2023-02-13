!(async function (exports) {
  'use strict';

  try {
    let service = await window.apiDaemon.getAudioVolumeManager();
    exports.AudioVolumeManager = service;
  } catch (e) {
    console.error(`AudioVolumeManager error: ${e}`);
  }
})(window);
