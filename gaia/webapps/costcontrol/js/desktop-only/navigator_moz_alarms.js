(function() {
  'use strict';

  if (navigator.b2g.alarmManager) {
    return;
  }

  navigator.b2g.alarmManager = {
    add: function() {
      var returnResult = {};

      setTimeout(() => {
        returnResult.result = {};
        if (typeof returnResult.onsuccess === 'function') {
          returnResult.onsuccess.call(returnResult);
        }
      });

      return returnResult;
    },

    remove: function() {}
  };
})();
