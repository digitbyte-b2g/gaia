/* exported NfcCore */
/* global BaseModule */
'use strict';

(function() {
  var NfcCore = function(nfc) {
    this.nfc = nfc;
  };

  NfcCore.IMPORTS = [
    'http://shared.localhost:8081/js/utilities.js',
    'http://shared.localhost:8081/js/nfc_utils.js'
  ];

  NfcCore.SUB_MODULES = [
    'NfcManager',
    'NfcHandler',
    'NdefUtils'
  ];
  /**
   * @class NfcCore
   */
  BaseModule.create(NfcCore, {
    name: 'NfcCore'
  });
}());
