!(function (exports) {
  'use strict';

  function ContextMenu(evt, array) {
    var overlay = document.getElementById('context-menu');
    overlay.classList.add('visible');

    var containerElement = document.getElementById('context-menu-content-items');
    containerElement.innerHTML = '';

    document.onclick = () => {
      overlay.classList.remove('visible');
    };

    array.forEach(item => {
      var element = document.createElement('li');
      containerElement.appendChild(element);

      if (item.type == 'separator') {
        element.classList.add('separator');
        return;
      }

      if (item.label) {
        element.textContent = item.label;
      }
      if (item.l10nId) {
        element.dataset.l10nId = item.l10nId;
      }
      if (item.disabled) {
        element.setAttribute('disabled', '');
      }
      if (item.icon) {
        element.dataset.icon = item.icon;
      }

      element.onclick = item.onclick;

      if (evt.pageX >= (window.innerWidth - overlay.getBoundingClientRect().width)) {
        overlay.style.left = (evt.pageX - overlay.getBoundingClientRect().width) + 'px';
      } else {
        overlay.style.left = evt.pageX + 'px';
      }
      if (evt.pageY >= (window.innerHeight - overlay.getBoundingClientRect().height)) {
        overlay.style.top = (evt.pageY - overlay.getBoundingClientRect().height) + 'px';
        overlay.classList.add('bottom');
      } else {
        overlay.style.top = evt.pageY + 'px';
        overlay.classList.remove('bottom');
      }
    });
  }

  exports.ContextMenu = ContextMenu;
})(window);
