'use strict';

// Tell audio channel manager that we want to adjust the alarm channel
// if the user press the volumeup/volumedown buttons in this app.
if (navigator.b2g.audioChannelManager) {
  navigator.b2g.audioChannelManager.volumeControlChannel = 'alarm';
}
