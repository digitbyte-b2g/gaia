/* global BaseModule */
'use strict';

(function() {
  // Responsible to load and init all modules for mozIccManager.
  var IccCore = function(icc, core) {
    this.core = core;
    this.icc = icc;
  };
  IccCore.IMPORTS = [
    'http://shared.localhost:8081/js/stk_helper.js',
    'js/icc_events.js',
    'js/icc_worker.js',
    'http://shared.localhost:8081/js/advanced_timer.js',
    'http://shared.localhost:8081/js/icc_helper.js'
  ];
  IccCore.SUB_MODULES = [
    'Icc'
  ];
  BaseModule.create(IccCore, {
    name: 'IccCore'
  });
}());
