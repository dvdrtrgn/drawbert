/*globals */

define(['jquery', 'lodash', 'util', 'cantextro', 'dom', 'gesture', 'reader',
], function ($, _, U, Cantextro, Dom, Gesture, Reader) {
  let dbug = 1;
  //
  // GLOBAL VARS
  //
  const C = window.console;
  const Gest = Gesture.make(); // point array for current stroke(s)
  const Recog = Reader.make(); // wrapper for pdollar recognizer
  let Render;
  let Down = false;
  let Api = {};

  const Df = {
    font: '20px impact',
    fillStyle: 'silver',
    lineWidth: 3,
    strokeStyle: 'black',
  };

  //
  // CONTEXT OPS
  //
  function drawText(str) {
    if (dbug) {
      Render.setMessage(str, 'darkgray');
    }
  }

  function clearCanvas() {
    Render.defaults().fillAll();
    Gest.clear();
    drawText('Canvas cleared');
  }

  function drawConnectedPoint() {
    Render.connectPoints(Gest.from, Gest.to);
  }

  //
  // DOM OPS
  //
  function hideOverlay() {
    Dom.hideOverlay();
    Dom.updateCount(trainingTotal());
  }

  //
  // RECOG OPS
  //
  function trainingTotal() {
    return Recog.count;
  }

  function initAlphabet() {
    if (window._initGestures) {
      window._initGestures(Recog);
    }
    if (window._initAlphabet) {
      window._initAlphabet(Recog);
    }
  }

  function nameGesture(name) {
    var num;

    if (Gest.enough && name.length > 0) {
      dbug && C.log(Gest);
      num = Recog.addGesture(name, Gest);
      drawText(`“${name}” added. Number of “${name}s” defined: ${num}.`);
      Gest.clear();
    }
  }

  function tryRecognize() {
    var result;

    if (Gest.enough) {
      result = Recog.recognize(Gest);
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
    } else {
      drawText('Not enough data');
    }
    return result;
  }

  function openTrainer() {
    var result = tryRecognize();
    if (result) {
      Dom.showOverlay(result);
    }
  }

  //
  // Mouse Handlers
  //
  function mouseDownEvent(x, y) {
    Down = true;
    x -= Render.box.x;
    y -= Render.box.y - U.getScrollY();

    Gest.stroke || clearCanvas(); // starting a new gesture
    Gest.nextStroke().addPoint(x, y);
    drawText(`Recording stroke #${Gest.stroke}...`);

    Render.newColor();
    Render.drawCirc(x, y, 8);
  }

  function mouseMoveEvent(x, y) {
    if (Down) {
      x -= Render.box.x;
      y -= Render.box.y - U.getScrollY();
      Gest.addPoint(x, y);
      drawConnectedPoint();
    }
  }

  function mouseUpEvent(x, y) {
    Render.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    drawText(`Stroke #${Gest.stroke} recorded`);
    tryRecognize();
  }

  //
  // Click Events
  //
  function onClickInit() {
    $('.js-init').hide();
    initAlphabet();
    Dom.updateCount(trainingTotal());
  }

  function assignGesture(evt) {
    var name = $(evt.target).data('name');

    if (U.undef(name)) {
      alert('Unknown gesture chosen.');
    } else {
      nameGesture(name);
      hideOverlay();
    }
  }

  function lineStart(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    if (evt.button === 2) {
      clearCanvas();
    } else {
      mouseDownEvent(evt.clientX, evt.clientY);
    }
  }

  function lineDraw(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    mouseMoveEvent(evt.clientX, evt.clientY);
  }

  function lineEnd(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    if (Down) {
      mouseUpEvent(evt.clientX, evt.clientY);
    }
  }

  // ================ BINDINGS ======================

  function resizeCanvas() {
    var $win = $(Render.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Render.size($win.width(), $win.height() - 60);
    clearCanvas();

    dbug && C.log(Render);
  }

  function init(canvas) {
    Api.Render = Render = Cantextro(canvas, Df);

    var $window = $(window);
    var $canvas = $(canvas);

    function bindHanders() {
      $window.on('resize', _.debounce(resizeCanvas, 333));
      $canvas.on('mousedown.pdollar touchstart.pdollar', lineStart);
      $canvas.on('mousemove.pdollar touchmove.pdollar', lineDraw);
      $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', lineEnd);

      $('.overlay').on('click.pdollar', hideOverlay);
      $('.js-clear-stroke').on('click.pdollar', clearCanvas);
      $('.js-init').on('click.pdollar', onClickInit);
      $('.js-check').on('click.pdollar', openTrainer);
      $('.js-choice').on('mousedown.pdollar', assignGesture);
    }

    bindHanders();
    resizeCanvas();
    Dom.updateCount(trainingTotal());

    if (dbug) {
      onClickInit(); // load gestures
    }
    Api.init = () => true; // only used once
  }

  Api = {
    init,
    Df,
    Gest,
    Recog,
  };

  return Api;
});

/*

*/
