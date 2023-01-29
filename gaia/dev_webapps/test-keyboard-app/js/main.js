var inputContext = null;
var keyboardElement;

function init() {
  keyboardElement = document.getElementById('keyboard');

  window.navigator.b2g.inputMethod.oninputcontextchange = function() {
    inputContext = navigator.b2g.inputMethod.inputcontext;
    resizeWindow();
  };

  window.addEventListener('resize', resizeWindow);

  keyboardElement.addEventListener('mousedown', function onMouseDown(evt) {
  // Prevent loosing focus to the currently focused app
  // Otherwise, right after mousedown event, the app will receive a focus event.
    evt.preventDefault();
  });

  var sendKeyElement = document.getElementById('sendKey');
  sendKeyElement.addEventListener('click', function sendKeyHandler() {
    var testString = '\\o/';
    for (var i = 0; i < testString.length; i++) {
      sendKey(testString.charCodeAt(i));
    }
  });

  var switchElement = document.getElementById('switchLayout');
  switchElement.addEventListener('click', function switchHandler() {
    var mgmt = navigator.b2g.inputMethod.mgmt;
    mgmt.next();
  });

  // long press to trigger IME menu
  var menuTimeout = 0;
  switchElement.addEventListener('touchstart', function longHandler() {
    menuTimeout = window.setTimeout(function menuTimeout() {
      var mgmt = navigator.b2g.inputMethod.mgmt;
      mgmt.showAll();
    }, 700);
  });

  switchElement.addEventListener('touchend', function longHandler() {
    clearTimeout(menuTimeout);
  });
}

function resizeWindow() {
  window.resizeTo(window.innerWidth, keyboardElement.clientHeight);
}

function sendKey(keyCode) {
  switch (keyCode) {
  case KeyEvent.DOM_VK_BACK_SPACE:
  case KeyEvent.DOM_VK_RETURN:
    if (inputContext) {
      inputContext.sendKey(keyCode, 0, 0);
    }
    break;

  default:
    if (inputContext) {
      inputContext.sendKey(0, keyCode, 0);
    }
    break;
  }
}

window.addEventListener('load', init);
