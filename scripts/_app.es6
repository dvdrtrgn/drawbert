/*globals */

define(['jquery', 'lodash', 'util', 'dom', 'gesture', 'reader', 'renderer',
], function ($, _, U, Dom, Gesture, Reader, Renderer) {
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
  // DOM OPS
  //
  function updateCount() {
    Dom.updateCount(trainingTotal());
  }

  function hideOverlay() {
    Dom.hideOverlay();
    updateCount();
  }

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
    drawText('Canvas cleared');
    updateCount();
  }

  function drawConnectedPoint() {
    Render.connectPoints(Gest.from, Gest.to);
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

  function resetGesture() {
    Gest.clear();
  }

  function nameGesture(name) {
    var num;

    if (Gest.enough && name.length > 0) {
      dbug && C.log(Gest);
      num = Recog.addGesture(name, Gest);
      drawText(`“${name}” added. Number of “${name}s” defined: ${num}.`);
      resetGesture();
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

    if (!Gest.stroke) {
      clearCanvas(); // starting a new gesture
      resetGesture();
    }
    Gest.addPoint(x, y);
    drawText(`Recording stroke #${Gest.stroke + 1}...`);

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
    let pointString = Gest.endStroke();
    Render.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    dbug && C.log(`Stroke #${Gest.stroke} recorded`, pointString);
    tryRecognize();
  }

  //
  // Click Events
  //
  function onClickInit() {
    $('.js-init').hide();
    initAlphabet();
    updateCount();
  }

  function normTouch(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
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
    normTouch(evt);
    if (evt.button === 2) {
      clearCanvas();
      resetGesture();
    } else {
      mouseDownEvent(evt.clientX, evt.clientY);
    }
  }

  function lineDraw(evt) {
    normTouch(evt);
    mouseMoveEvent(evt.clientX, evt.clientY);
  }

  function lineEnd(evt) {
    normTouch(evt);
    if (Down) {
      mouseUpEvent(evt.clientX, evt.clientY);
    }
  }

  // ================ BINDINGS ======================

  function initTool() {
    var $win = $(Render.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Render.size($win.width(), $win.height() - 60);
    resetGesture();
    clearCanvas();

    dbug && C.log(Render);
  }

  function init(canvas) {
    Api.Render = Render = Renderer(canvas, Df);

    var $window = $(window);
    var $canvas = $(canvas);

    function bindHanders() {
      $window.on('resize', _.debounce(initTool, 333));
      $canvas.on('mousedown.pdollar touchstart.pdollar', lineStart);
      $canvas.on('mousemove.pdollar touchmove.pdollar', lineDraw);
      $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', lineEnd);

      $('.overlay').on('click.pdollar', hideOverlay);
      $('.js-clear-stroke').on('click.pdollar', initTool);
      $('.js-init').on('click.pdollar', onClickInit);
      $('.js-check').on('click.pdollar', openTrainer);
      $('.js-choice').on('mousedown.pdollar', assignGesture);
    }

    bindHanders();
    initTool();
    updateCount();

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
