(function(window) {
'use strict';

var proto = Object.create(HTMLElement.prototype);

var isTouch = 'ontouchstart' in window;

proto.createdCallback = function() {
  var shadowRoot = this.createShadowRoot();
  shadowRoot.innerHTML =
`<style>
  [data-icon]:before { /* Copied from /components/gaia-icons/gaia-icons.css */
    font-family: "gaia-icons";
    content: attr(data-icon);
    display: inline-block;
    font-weight: 500;
    font-style: normal;
    text-decoration: inherit;
    text-transform: none;
    text-rendering: optimizeLegibility;
    font-size: 30px;
    -webkit-font-smoothing: antialiased;
  }
  #container {
    direction: ltr;
    display: flex;
    flex-flow: row wrap;
    position: relative;
    width: 100%;
    height: 9rem;
    padding: 1rem 0 0;
    box-sizing: border-box;
    justify-content: center;
    -moz-user-select: none;
  }
  #container > button {
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--music-text-color, var(--text-color, #333));
    position: relative;
    padding: 0;
    width: 7rem;
    height: 7rem;
    transition: background 0.2s ease;
    box-shadow: 1rem 1rem 1.5rem rgba(0,0,0,0.125), -1rem -1rem 1.5rem rgba(255,255,255,0.125);
    margin: 0 1.5rem;
  }
  #container > button:hover {
    background: var(--translucent, rgba(0,0,0,0.05));
    transition: none;
  }
  #container > button:active {
    background: var(--translucent, rgba(0,0,0,0.1));
    transition: none;
    box-shadow: inset 1rem 1rem 1.5rem rgba(0,0,0,0.125), inset -1rem -1rem 1.5rem rgba(255,255,255,0.125);
  }
  #container > button:disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  #container > #previous,
  #container > #next {
    width: 5rem;
    height: 5rem;
    margin: 1rem 1.5rem;
  }
  #container > #previous:before,
  #container > #next:before {
    font-size: 2.4rem;
  }
</style>
<div id="container">
  <button type="button" id="previous"
      data-icon="skip-back"
      data-l10n-id="playbackPrevious">
  </button>
  <button type="button" id="toggle"
      data-icon="play"
      data-l10n-id="playbackPlay">
  </button>
  <button type="button" id="next"
      data-icon="skip-forward"
      data-l10n-id="playbackNext">
  </button>
</div>`;

  var $id = shadowRoot.getElementById.bind(shadowRoot);

  this.els = {
    container: $id('container'),
    previous:  $id('previous'),
    toggle:    $id('toggle'),
    next:      $id('next')
  };

  var seeking = false;

  this.els.container.addEventListener('contextmenu', (evt) => {
    evt.preventDefault();

    if (seeking) {
      return;
    }

    var button = evt.target.closest('button');
    if (button.id === 'previous' || button.id === 'next') {
      seeking = true;

      this.dispatchEvent(new CustomEvent('startseek', {
        detail: { reverse: button.id === 'previous' }
      }));
    }
  });

  this.els.container.addEventListener(isTouch ? 'touchend' : 'mouseup',
    (evt) => {
      if (seeking) {
        evt.preventDefault();

        this.dispatchEvent(new CustomEvent('stopseek'));
        seeking = false;
      }
    }
  );

  this.els.container.addEventListener('click', (evt) => {
    var button = evt.target.closest('button');
    switch (button.id) {
      case 'previous':
      case 'next':
        this.dispatchEvent(new CustomEvent(button.id));
        break;
      case 'toggle':
        this.paused = !this.paused;
        this.dispatchEvent(new CustomEvent(this.paused ? 'pause' : 'play'));
        break;
    }
  });

  this.onDOMRetranslated = () => {
    document.l10n.translateFragment(shadowRoot);
  };
};

proto.attachedCallback = function() {
  document.addEventListener('DOMRetranslated', this.onDOMRetranslated);
  this.onDOMRetranslated();
};

proto.detachedCallback = function() {
  document.removeEventListener('DOMRetranslated', this.onDOMRetranslated);
};

Object.defineProperty(proto, 'paused', {
  get: function() {
    return this.els.toggle.dataset.icon !== 'pause';
  },

  set: function(value) {
    var paused = !!value;
    if (paused === this.paused) {
      return;
    }

    this.els.toggle.dataset.icon   = paused ? 'play' : 'pause';
    this.els.toggle.dataset.l10nId = paused ? 'playbackPlay' : 'playbackPause';

    this.onDOMRetranslated();
  }
});

try {
  window.MusicControls = document.registerElement('music-controls', {
    prototype: proto
  });
} catch (e) {
  if (e.name !== 'NotSupportedError') {
    throw e;
  }
}

})(window);
