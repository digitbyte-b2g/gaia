'use strict';

window.addEventListener('load', function () {
  var retainedSize = 32;

  var mainList = document.getElementById('main-list');
  var mainListTitle = document.getElementById('main-list-title');

  mainList.addEventListener('scroll', () => {
    var y = 32 - (mainList.scrollTop / 2);
    if (y < 24) {
      y = 24;
    }
    if (y > 32) {
      y = 32;
    }

    mainListTitle.style.fontSize = y + 'px';
    mainListTitle.style.lineHeight = y + 'px';
    retainedSize = y;
  });
});
