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
  searchbar: document.getElementById('launcher-search'),
  grid: document.getElementById('launcher-grid'),
  settingsButton: document.getElementById('launcher-settings'),
  launcherButton: document.getElementById('panel-launcher'),
  searchButton: document.getElementById('panel-search'),
  taskbarIconContainer: document.getElementById('panel-tasks'),

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

    this.generatePinnedIcons();
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
          this.element.classList.add('transition-opening');
          this.element.addEventListener('animationend', () => {
            this.element.classList.remove('transition-opening');
            this.motionElement.scrollTop = this.motionElement.offsetHeight;
          });
        } else {
          this.element.classList.add('transition-closing');
          this.element.addEventListener('animationend', () => {
            this.element.classList.remove('transition-closing');
            this.motionElement.scrollTop = 0;
          });
        }
        this.shown = !this.shown;
        break;

      case this.searchbar:
      case this.searchButton:
        window.dispatchEvent(new CustomEvent('global-search-request'));
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
    var mgmt = AppsManager;
    mgmt.getAll().onsuccess = (evt) => {
      evt.target.result.forEach(app => {
        if (this.HIDDEN_ROLES.indexOf(this.getAppRole(app)) !== -1) {
          return;
        }

        var element = document.createElement('div');
        element.dataset.origin = app.origin;
        element.classList.add('icon');
        element.addEventListener('click', () => {
          applications.getByManifestURL(app.manifestURL).launch();
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
  },

  /**
   * This function creates the pinned app icons in the taskbar.
   * ```
    <div class="task-preview">
      <header>
        <a href="#" data-icon="close" class="close"></a>
        <h1 class="title"></h1>
      </header>
      <div class="screenshot"></div>
    </div>
    ```
   */
  generatePinnedIcons: function al_generatePinnedIcons() {
    var mgmt = AppsManager;
    mgmt.getAll().onsuccess = (evt) => {
      var settings = SettingsObserver;

      var PINNED_APPS = 'taskbar.pinned_apps';
      var pinnedApps = settings.getValue(PINNED_APPS);
      pinnedApps.onsuccess = () => {
        var result = pinnedApps.result[PINNED_APPS] || [
          'app://search.gaiamobile.org',
          'app://files.gaiamobile.org',
          'app://marketplace.gaiamobile.org',
          'app://email.gaiamobile.org',
          'app://music.gaiamobile.org',
          'app://videos.gaiamobile.org'
        ];

        evt.target.result.forEach(app => {
          if (result.indexOf(app.origin) == -1) {
            return;
          }

          var element = document.createElement('li');
          element.dataset.origin = app.origin;
          element.dataset.pinned = true;
          element.classList.add('task');
          element.addEventListener('click', () => {
            applications.getByManifestURL(app.manifestURL).launch();
          });
          mgmt.getIcon(app, this.ICON_SIZE).then(blob => {
            element.style.backgroundImage = 'url(' + window.URL.createObjectURL(blob) + ')';
          });
          this.taskbarIconContainer.appendChild(element);

          element.addEventListener('mouseenter', () => {
            var window = document.querySelector('[data-origin="' + app.origin + '"]');
            if (window) {
              closeButton.style.display = 'block';
              screenshot.style.display = 'block';
              screenshot.style.backgroundImage = '#' + window.id;
            } else {
              closeButton.style.display = 'none';
              screenshot.style.display = 'none';
            }
          });

          element.addEventListener('click', () => {
            var window = document.querySelector('[data-origin="' + app.origin + '"]');
            if (window) {
              evt.preventDefault();
              var active = document.querySelector('.appWindow.active:not(.will-become-inactive):not(.back)');
              if (active) {
                active.classList.remove('active');
                active.classList.add('inactive');
              }
              window.classList.remove('inactive');
              window.classList.add('active');

              var activeIcon = document.querySelector('#panel-tasks .task.active');
              if (activeIcon) {
                activeIcon.classList.remove('active');
              }
              if (this.panelIcon) {
                this.panelIcon.classList.add('active');
              }

              if (window.classList.contains('reduce')) {
                window.classList.remove('reduce');
                window.classList.remove('minimized-app');
                window.classList.add('enlarge');
                window.addEventListener('transitionend', () => {
                  window.classList.remove('enlarge');
                });
              }
            } else {
              applications.getByManifestURL(app.manifestURL).launch();
              window = document.querySelector('[data-origin="' + app.origin + '"]')
            }
          });

          var previewSection = document.createElement('div');
          previewSection.classList.add('task-preview');
          element.appendChild(previewSection);

          var header = document.createElement('header');
          previewSection.appendChild(header);

          var closeButton = document.createElement('a');
          closeButton.href = '#';
          closeButton.dataset.icon = 'close';
          closeButton.classList.add('close-button');
          header.appendChild(closeButton);

          var name = document.createElement('h1');
          name.textContent = this.getAppName(app);
          header.appendChild(name);

          var screenshot = document.createElement('div');
          previewSection.appendChild(screenshot);
        });
      };
    };
  }
};

AppLauncher.init();

})(window);
