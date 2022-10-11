'use strict';

(function(exports) {
/**
 * Similar to Windows 11's start menu. It has icon grid with installed apps that opens a app window on a click.
 */
exports.AppLauncher = {
  name: 'AppLauncher',

  shown: false,

  element: document.getElementById('launcher'),
  motionElement: document.getElementById('launcher-motion'),
  grid: document.getElementById('launcher-grid'),
  settingsButton: document.getElementById('launcher-settings'),
  launcherButton: document.getElementById('panel-launcher'),

  profileButton: document.getElementById('launcher-profile'),
  profileAvatar: document.getElementById('launcher-profile-avatar'),
  profileUsername: document.getElementById('launcher-profile-username'),
  EVENT_PREFIX: 'applauncher',

  ICON_SIZE: 48 * window.devicePixelRatio,
  HIDDEN_ROLES: [
    'system', 'input', 'homescreen', 'theme', 'addon', 'langpack'
  ],

  icons: [],

  /**
   * This function dispatches custom events for the launcher.
   * @param {String} evtName
   */
  publish: function(evtName) {
    window.dispatchEvent(new CustomEvent(this.EVENT_PREFIX + evtName, {
      detail: this
    }));
  },

  /**
   * This function returns if the launcher is open or not. Please use instead of 'this.shown'.
   * @returns boolean
   */
  isActive: function() {
    return this.shown;
  },

  focus: function() {},
  blur: function() {},

  /**
   * We use this function to initiate the stuff we need.
   */
  init: function al_init() {
    this.launcherButton.addEventListener('click', this);
    this.profileButton.addEventListener('click', this);
    this.settingsButton.addEventListener('click', this);

    this.generateIcons();

    this.publish('load');
  },

  /**
   * This function handles all events.
   * @param {Event} evt
   */
  handleEvent: function al_handleEvent(evt) {
    var detail = evt.detail;

    switch (evt.type) {
      case 'click':
        this.handleClickEvent(evt);
        break;

      case 'dblclick':
        this.motionElement.classList.toggle('maximized');
    }
  },

  /**
   * This function handles click events.
   * @param {Event} evt
   */
  handleClickEvent: function al_handleClickEvent(evt) {
    switch (evt.target) {
      case this.launcherButton:
        if (this.isActive()) {
          this.motionElement.scrollTop = this.motionElement.offsetHeight;
        } else {
          this.motionElement.scrollTop = 0;
        }
        this.shown = !this.shown;
        break;

      case this.profileButton:
      case this.settingsButton:
        applications.getByManifestURL(
            'app://settings.gaiamobile.org/manifest.webapp').launch();
        break;
    }
  },

  /**
   * This helps us get the name of an app.
   * @param {*} app 
   * @returns {String}
   */
  getAppName: function al_getAppName(app) {
    if (app.manifest.entry_points) {
      if (app.manifest.entry_points.name) {
        return app.manifest.entry_points.name;
      }
    } else {
      return app.manifest.name;
    }
  },

  /**
   * This helps us get the role of an app.
   * @param {*} app 
   * @returns {String}
   */
  getAppRole: function al_getAppRole(app) {
    if (app.manifest.entry_points) {
      if (app.manifest.entry_points.role) {
        return app.manifest.entry_points.role;
      }
    } else {
      return app.manifest.role;
    }
  },

  /**
   * This function creates the app icons we need for our grid box in the system webapp launcher.
   */
  generateIcons: function al_generateIcons() {
    var mgmt = navigator.mozApps.mgmt;
    mgmt.getAll().onsuccess = (evt) => {
      evt.target.result.forEach(app => {
        if (this.HIDDEN_ROLES.indexOf(this.getAppRole(app)) !== -1) {
          return;
        }

        var element = document.createElement('div');
        element.dataset.origin = app.origin;
        element.classList.add('icon');
        element.addEventListener('click', () => {
          applications.getByManifestURL(app.origin + '/manifest.webapp').launch();
        });
        this.grid.appendChild(element);

        var iconHolder = document.createElement('div');
        element.appendChild(iconHolder);

        var icon = document.createElement('img');
        icon.onerror = function() {
          icon.src = 'style/icons/Default.png';
        };
        mgmt.getIcon(app, this.ICON_SIZE).then(blob => {
          icon.src = window.URL.createObjectURL(blob);
        });
        iconHolder.appendChild(icon);

        var name = document.createElement('p');
        name.textContent = this.getAppName(app);
        element.appendChild(name);
      });
    };
  }
};

AppLauncher.init();

})(window);
