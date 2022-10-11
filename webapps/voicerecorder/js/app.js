// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function () {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  // 'use strict';

  /*
   * To change this license header, choose License Headers in Project Properties.
   * To change this template file, choose Tools | Templates
   * and open the template in the editor.
   */

  var isRecording = false;
  var timer = document.getElementById('timer');
  var recordButton = document.getElementById("record-button");
  var requestButton = document.getElementById("request-button");

  var totalSeconds = 0;
  var timeCounter = setInterval(setTime, 1000);

  function setTime() {
    if (isRecording) {
      ++totalSeconds;
      timer.innerHTML = pad(parseInt((totalSeconds / 60) / 99)) + ':' + pad(parseInt(totalSeconds / 60)) + ':' + pad(totalSeconds % 60);
    }
  }

  function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
  }

  if (navigator.getUserMedia) {
    console.log("supported");
    navigator.mozGetUserMedia({
      video: false,
      audio: true
    },
      function (stream) {
        var mediaRecorder = new MediaRecorder(stream);

        requestButton.onclick = function () {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.requestData();
          } else {
            console.log("no data");
          }
        }

        recordButton.onclick = function () {
          if (!isRecording) {
            var myStream = mediaRecorder.stream;
            mediaRecorder.start();
            console.log(myStream);
            console.log("recorder started :", mediaRecorder.state);
          } else {
            mediaRecorder.stop();
            console.log("recorder stopped, data available :", mediaRecorder.state);
          }
          isRecording = !isRecording;
        }

        mediaRecorder.ondataavailable = function (e) {
          console.log(mediaRecorder.state);
          var audioblob = e.data;
          console.log(audioblob);

          var sdcard = navigator.getDeviceStorage('music');
          var filename = Date.now() + ".ogg";
          var request = sdcard.addNamed(audioblob, filename);
          request.onsuccess = function () {
            var name = this.result;
            console.log('File "' + name + '" successfully wrote on the sdcard storage area');

            var audio = document.createElement('audio');
            audio.setAttribute('controls', '');
            var audioURL = window.URL.createObjectURL(audioblob);
            console.log(audioURL);
            audio.src = audioURL;
            audio.play();
          }

          // An error typically occur if a file with the same name already exist
          request.onerror = function () {
            console.warn('Unable to write the file: ' + this.error);
          }
        }
      },

      // errorCallback
      function (err) {
        console.log("The following error occured: " + err);
      }
    );
  } else {
    console.log("not working");
  }
});
