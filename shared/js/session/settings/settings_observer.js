!(async function(exports) {
  'use strict';

  class SettingsObserver {
    constructor () {
      this.settingsObserver = window.apiDaemon.getSettings();
    }

    async getValue(name) {
      let service = await this.settingsObserver;

      try {
        let setting = await service.get(name);
        return setting.value;
      } catch (e) {
        console.error(e);
      }
    }

    async setValue(name, value) {
      let service = await this.settingsObserver;

      try {
        let setting = { name: name, value: value };
        await service.set([setting]);
      } catch (e) {
        console.error(e);
      }
    }
  }

  exports.SettingsObserver = SettingsObserver;
})(window);