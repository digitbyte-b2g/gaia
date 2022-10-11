'use strict';

var Drawing = {
  selectedColor: '#000000',
  selectedThickness: 8,
  zoom: 1,

  defaultColors: [
    '#ffffff',
    '#c0c0c0',
    '#858585',
    '#404040',
    '#000000',
    '#c00040',
    '#ff6040',
    '#ff9020',
    '#ffc000',
    '#80d060',
    '#40a060',
    '#00ddff',
    '#0061e0',
    '#8040a0',
    '#ff60c0'
  ],

  canvas: document.getElementById('drawing-canvas'),
  canvasContainer: document.getElementById('drawing-canvas-container'),
  colorList: document.getElementById('color-list'),
  colorPicker: document.getElementById('color-picker'),
  thickness: document.getElementById('thickness'),
  shuffle: document.getElementById('shuffle'),

  init: function d_init() {
    window.addEventListener('resize', this);
    document.addEventListener('wheel', this);

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.thickness.min = 1;
    this.thickness.max = 50;
    this.thickness.value = this.selectedThickness;
    this.thickness.addEventListener('change', this);

    this.initDrawGestures();
    this._render();
  },

  _render: function d__render() {
    console.log(this.canvas);
    this.defaultColors.forEach((color) => {
      var element = document.createElement('div');
      element.style.backgroundColor = color;
      if (this.selectedColor == color) {
        element.classList.add('selected');
      }
      if (color == this.defaultColors[3] ||
          color == this.defaultColors[4] ||
          color == this.defaultColors[5] ||
          color == this.defaultColors[12] ||
          color == this.defaultColors[13]) {
        element.classList.add('dark');
      }

      element.addEventListener('click', () => {
        var selected = this.colorList.querySelector('.selected');
        if (selected) {
          selected.classList.remove('selected');
        }

        element.classList.add('selected');
        this.selectedColor = color;
        this.initDrawGestures();
      });
      this.colorList.appendChild(element);
    });
  },

  handleEvent: function d_handleEvent(evt) {
    switch (evt.type) {
      case 'resize':
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        break;

      case 'wheel':
        var delta = evt.deltaY * 0.0625;
        if (delta) {
          this.zoom += delta;
        }

        if (this.zoom >= 10) {
          this.zoom = 10;
        }
        if (this.zoom <= 0.5) {
          this.zoom = 0.5;
        }
        this.canvasContainer.scrollLeft = (evt.clientX * this.zoom);
        this.canvasContainer.scrollTop = (evt.clientY * this.zoom);
        this.canvas.style.transform = `scale(${this.zoom})`;
        break;

      case 'change':
        switch (evt.target) {
          case this.thickness:
            this.selectedThickness = this.thickness.value;
            break;
        }
    }
  },

  initDrawGestures: function d_initDrawGestures() {
    var ctx = this.canvas.getContext('2d');
    this.canvas.ontouchstart = (evt) => {
      var x = ((evt.touches[0].clientX / this.zoom) - (this.selectedThickness * this.zoom));
      var y = ((evt.touches[0].clientY / this.zoom) - (this.selectedThickness * this.zoom));
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.selectedThickness;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      document.ontouchmove = (evt) => {
        ctx.strokeStyle = this.selectedColor;
        ctx.lineWidth = this.selectedThickness;
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = ((evt.touches[0].clientX / this.zoom) - (this.selectedThickness * this.zoom));
        y = ((evt.touches[0].clientY / this.zoom) - (this.selectedThickness * this.zoom));
        ctx.lineTo(x, y);
        ctx.stroke();
      };
      document.ontouchend = (evt) => {
        document.ontouchmove = null;
        document.ontouchend = null;
      };
    };

    this.canvas.onmousedown = (evt) => {
      var x = ((evt.clientX / this.zoom) - (this.selectedThickness * this.zoom));
      var y = ((evt.clientY / this.zoom) - (this.selectedThickness * this.zoom));
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.selectedThickness;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      document.onmousemove = (evt) => {
        ctx.strokeStyle = this.selectedColor;
        ctx.lineWidth = this.selectedThickness;
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = ((evt.clientX / this.zoom) - (this.selectedThickness * this.zoom));
        y = ((evt.clientY / this.zoom) - (this.selectedThickness * this.zoom));
        ctx.lineTo(x, y);
        ctx.stroke();
      };
      document.onmouseup = (evt) => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },

  saveImage: function d_saveImage() {
    var imageBlob = '';

    var sdcard = navigator.getDeviceStorage('pictures');
    var filename = Date.now() + ".png";
    var request = sdcard.addNamed(imageBlob, filename);
    request.onerror = function () {
      console.warn('Unable to write the file: ' + this.error);
    }
  }
};

Drawing.init();
