define(function(require) {
'use strict';

var asyncStorage = require('shared/js/async_storage');
var Utils = require('utils');

var timerPrivate = new WeakMap();
var clockSound = new Audio('resources/sounds/clock.wav');
clockSound.onended = () => {
  clockSound.play();
};

/**
 * Timer
 *
 * Create new or revive existing timer objects.
 *
 * @param {Object} opts Optional timer object to create or revive
 *                      a new or existing timer object.
 *                 - startTime, number time in ms.
 *                 - duration, time to count from `start`.
 *                 - configuredDuration, time requested by user.
 *                 - sound, string sound name.
 *                 - vibrate, boolean, vibrate or not.
 *                 - id, integer, mozAlarm API id number.
 */
function Timer(opts) {
  opts = opts || {};

  var now = Date.now();
  if (opts.id !== undefined) {
    delete opts.id;
  }
  // private properties
  timerPrivate.set(this, Utils.extend({
    state: Timer.INITIAL
  }, extractProtected(opts)));
  // public properties
  Utils.extend(this, {
    startTime: now,
    duration: null,
    configuredDuration: null,
    sound: 'ac_awake.opus',
    vibrate: true
  }, opts);
}

Timer.prototype.constructor = Timer;

/**
 * request - get the persisted Timer object.
 *
 * @param {function} [callback] - called with (err, timer_raw).
 */
Timer.getFromStorage = function(callback) {
  asyncStorage.getItem('active_timer', function(timer) {
    if (timer) {
      // Normalize the timer data. Pre-April-2014 code may have stored
      // 'vibrate' and 'sound' as the string "0".
      timer.sound = (timer.sound !== '0' ? timer.sound : null);
      timer.vibrate = (timer.vibrate && timer.vibrate !== '0');
    }
    callback && callback(timer || null);
  });
};

/**
 * singleton - get the unique persisted Timer object.
 *
 * @param {function} [callback] - called with (err, timer).
 */
var timerSingleton = Utils.singleton(Timer);
Timer.singleton = function tm_singleton(callback) {
  Timer.getFromStorage(function(err, obj) {
    var ts = timerSingleton(obj);
    callback && callback(null, ts);
  });
};

function extractProtected(config) {
  var ret = {};
  var protectedProperties = new Set(['state']);
  for (var i in config) {
    if (protectedProperties.has(i)) {
      ret[i] = config[i];
      delete config[i];
    }
  }
  return ret;
}

/**
 * toSerializable - convert `this` to a serialized format.
 *
 * @return {object} - object representation of this Timer.
 */
Timer.prototype.toSerializable = function timerToSerializable() {
  var timer = Utils.extend({}, this, timerPrivate.get(this));

  // Normalize the data. TODO: Perform this normalization immediately
  // at the getter/setter level when this class is refactored.
  return {
    startTime: timer.startTime,
    duration: timer.duration,
    configuredDuration: timer.configuredDuration,
    sound: (timer.sound !== '0' ? timer.sound : null),
    vibrate: (timer.vibrate !== '0' ? timer.vibrate : null),
    state: timer.state
  };
};

/**
 * save - Save the timer to the database.
 *
 * @param {function} [callback] - callback to call after the timer
 *                                has been saved.
 */
Timer.prototype.save = function timerSave(callback) {
  asyncStorage.setItem('active_timer', this.toSerializable(), function() {
    callback && callback(null, this);
  }.bind(this));
};

/**
 * register - Register the timer with mozAlarm API.
 *
 * @param {function} [callback] - callback to call after the timer
 *                                has been registered.
 */
Timer.prototype.register = function timerRegister(callback) {
  var data = {
    type: 'timer'
  };
  var request;

  // Remove previously-created mozAlarm for this alarm, if necessary.
  this.unregister();

  request = navigator.b2g.alarmManager.add(
    new Date(Date.now() + this.remaining), 'ignoreTimezone', data
  );

  request.onsuccess = (function(ev) {
    this.id = ev.target.result;
    callback && callback(null, this);
  }.bind(this));
  request.onerror = function(ev) {
    callback && callback(ev.target.error);
  };
};

/**
 * commit - save and register the timer as necessary.
 *
 * @param {function} [callback] - callback to call after the timer
 *                                has been registered.
 */
Timer.prototype.commit = function timerCommit(callback) {
  var saveSelf = this.save.bind(this, callback);
  if (this.state === Timer.STARTED) {
    this.register(saveSelf);
  } else {
    this.unregister();
    saveSelf();
  }
};

Timer.prototype.unregister = function timerUnregister() {
  if (typeof this.id === 'number') {
    navigator.b2g.alarmManager.remove(this.id);
  }
};

Object.defineProperty(Timer.prototype, 'remaining', {
  get: function() {
    if (this.state === Timer.INITIAL) {
      return this.configuredDuration;
    } else if (this.state === Timer.PAUSED) {
      return this.duration;
    } else if (this.state === Timer.STARTED) {
      if (typeof this.startTime === 'undefined' ||
          typeof this.duration === 'undefined') {
        return 0;
      }
      var r = (this.startTime + this.duration) - Date.now();
      return r >= 0 ? r : 0;
    }
  }
});

Object.defineProperty(Timer.prototype, 'state', {
  get: function() {
    var priv = timerPrivate.get(this);
    return priv.state;
  }
});

Timer.prototype.start = function timerStart() {
  if (this.state !== Timer.STARTED) {
    var priv = timerPrivate.get(this);
    priv.state = Timer.STARTED;
    this.startTime = Date.now();
    this.duration = (typeof this.duration === 'number') ? this.duration :
      this.configuredDuration;
    window.dispatchEvent(new CustomEvent('timer-start', {
      detail: { remaining: this.remaining }
    }));
    this._tick();
    clockSound.play();
  }
};

Timer.prototype.pause = function timerPause() {
  if (this.state === Timer.STARTED) {
    this.duration = this.remaining; // remaining getter observes private state
    var priv = timerPrivate.get(this);
    priv.state = Timer.PAUSED;
    this.startTime = null;
    this._cancelTick();
    window.dispatchEvent(new CustomEvent('timer-pause', {
      detail: { remaining: this.remaining }
    }));
    clockSound.stop();
  }
};

Timer.prototype.cancel = function timerReset() {
  if (this.state !== Timer.INITIAL) {
    var priv = timerPrivate.get(this);
    priv.state = Timer.INITIAL;
    this.startTime = null;
    this.duration = this.configuredDuration;
    this._cancelTick();
    this._dispatchEnd();
  }
};

/**
 * plus Increase the duration and extend the endAt time
 *
 * @param {Number} seconds The time in seconds to add.
 *
 * @return {Timer} Timer instance.
 */
Timer.prototype.plus = function timerPlus(seconds) {
  // Convert to ms
  var ms = seconds * 1000;

  this.duration += ms;

  return this;
};

Timer.prototype._dispatchEnd = function timerDispatchEnd() {
  // cancel and end are basically the same thing
  window.dispatchEvent(new CustomEvent('timer-end', {
    detail: { remaining: 0 }
  }));
};

Timer.prototype._tick = function timerTick() {
  if (this.state !== Timer.STARTED) {
    return;
  }

  // we cache the previous value posted to avoid triggering multiple "tick"
  // messages for the same second
  var remaining = this.remaining;
  var current = Math.round(remaining / 1000);
  if (current !== this._previousTick) {
    this._previousTick = current;
    window.dispatchEvent(new CustomEvent('timer-tick', {
      detail: { remaining: remaining }
    }));
  }

  if (remaining > 0) {
    // use setTimeout instead of requestAnimationFrame because window will
    // probably be hidden when handling connections
    this._tickTimeout = window.setTimeout(() => this._tick(), 100);
  } else {
    this._dispatchEnd();
  }
};

Timer.prototype._cancelTick = function timerCancelTick() {
  window.clearTimeout(this._tickTimeout);
};

/**
 * Static "const" Timer states.
 */
Object.defineProperties(Timer, {
  INITIAL: { value: 0 },
  STARTED: { value: 1 },
  PAUSED: { value: 2 }
});

return Timer;
});
