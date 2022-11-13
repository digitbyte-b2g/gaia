(function(exports) {
  'use strict';

  var icons = document.querySelectorAll('#grid div');
  icons.forEach((icon) => {
    icon.addEventListener('drop', drop);
    icon.addEventListener('dragover', allowDrop);
    icon.children[0].addEventListener('dragstart', drag);
  });

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function drag(evt) {
    evt.dataTransfer.setData("text", evt.target.id);
  }

  function drop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    evt.target.appendChild(document.getElementById(data));
  }
})(window);