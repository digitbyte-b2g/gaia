window.contextMenu = (evt, array) => {
  var overlay = document.getElementById('context-menu');
  overlay.style.left = evt.pageX + 'px';
  overlay.style.top = evt.pageY + 'px';
  overlay.classList.add('visible');

  var containerElement = document.getElementById('context-menu-content-items');
  containerElement.innerHTML = '';

  document.onclick = () => {
    overlay.classList.remove('visible');
  };

  array.forEach(obj => {
    var element = document.createElement('li');
    containerElement.appendChild(element);

    if (obj.type == 'seperator') {
      element.classList.add('seperator');
      return;
    }

    if (obj.label) {
      element.textContent = obj.label;
    }
    if (obj.l10nId) {
      element.dataset.l10nId = obj.l10nId;
    }
    if (obj.disabled) {
      element.setAttribute('disabled', '');
    }
    if (obj.icon) {
      element.dataset.icon = obj.icon;
    }

    element.onclick = obj.onclick;
  });
};