/* global BaseModule, CustomDialog, LazyLoader */
'use strict';

(function() {
  /**
   * The module is grouping custom dialog request.
   * It will lazy load CustomDialog once the first request comes.
   * XXX: All custom dialogs in system app
   * should be transfered into systemDialog in the future.
   */
  var CustomDialogService = function() {};
  CustomDialogService.SERVICES = [
    'showCustomDialog',
    'hideCustomDialog'
  ];
  BaseModule.create(CustomDialogService, {
    name: 'CustomDialogService',
    showCustomDialog: function(title, msg, cancel, confirm) {
      return LazyLoader.load(['http://shared.localhost:8081/js/custom_dialog.js']).then(() => {
        CustomDialog.show(title, msg, cancel, confirm,
          document.getElementById('screen'))
                    .setAttribute('data-z-index-level', 'system-dialog');
      }).catch((err) => {
        console.error(err);
      });
    },
    hideCustomDialog: function() {
      if (window.CustomDialog) {
        CustomDialog && CustomDialog.hide();
      }
    }
  });  
}());
