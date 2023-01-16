/**
 * Wraps navigator.bluetooth for replacing it in unit tests more easily.
 */
define(function() {
  'use strict';

  if (navigator.b2g.bluetooth) {
    return navigator.b2g.bluetooth;
  } else {
    return null;
  }
});
