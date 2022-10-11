(function(exports) {
  'use strict';

  function Browser(element, isPrivate) {
    this.element = element;
    this.isPrivate = isPrivate;
    this.init();
  }

  Browser.prototype = {
    CLASS_LIST: 'browserChrome',

    init: function br_init() {
      this._render();
    },

    view: function br_view() {
      return `<div class="${this.CLASS_LIST}" id="${this.instanceID}">
                <div class="tab-list"></div>
                <div class="navbar"></div>
                <div class="content"></div>
                <div class="context-menu"></div>
              </div>`;
    }
  };

  exports.Browser = Browser;
})(window);