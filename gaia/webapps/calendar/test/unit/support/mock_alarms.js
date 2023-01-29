define(function(require, exports) {
'use strict';

var _id = 0;
var alarms = [];
var mozAlarms;

exports.setup = function() {
  mozAlarms = navigator.b2g.alarmManager;
  navigator.b2g.alarmManager = exports;
};

exports.teardown = function() {
  removeAll();
  navigator.b2g.alarmManager = mozAlarms;
};

exports.add = function(date, honorTimezone, data) {
  var alarmId = _id++;
  alarms.push({
    alarmId: alarmId,
    date: date,
    honorTimezone: honorTimezone,
    data: data
  });

  return resolve(alarmId);
};

exports.getAll = function() {
  return resolve(alarms);
};

exports.remove = function(alarmId) {
  alarms = alarms.filter(alarm => alarm.alarmId !== alarmId);
};

function removeAll() {
  alarms = [];
}

function resolve(result) {
  var request = { onsuccess: null, onerror: null };
  var requestContext = {};
  requestContext.result = result;
  setTimeout(() => {
    return request.onsuccess &&
           request.onsuccess.call(requestContext, result);
  }, 10);

  return request;
}

});
