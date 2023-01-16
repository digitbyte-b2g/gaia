(function() {
  'use strict';

  if (navigator.b2g.mobileConnections) {
    return;
  }

  navigator.b2g.mobileConnections = navigator.mozIccManager.iccIds.map((id) => {
    return { iccId: id};
  });
})();
