/*globals */

define(['jquery', 'lodash', 'util', 'dom', 'gesture', 'reader', 'renderer',
], function ($, _, U, Dom, gesture, reader, renderer) {
  let dbug = 1;
  //
  // GLOBAL VARS
  //
  const C = window.console;
  let Gest; // point array for current stroke(s)
  let Reads; // wrapper for pdollar recognizer
  let Render; // canvas toolkit
  let Down = false;
  let Api = {};

  const Df = {
    font: '20px impact',
    fillStyle: 'silver',
    lineWidth: 3,
    strokeStyle: 'gray',
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
    return Reads.count;
  }

  function initData(cb) {
    require(['init_alphabet', 'init_gestures'], function (...arr) {
      arr.map(Reads.processData);
      cb && cb();
    });
  }

  function resetGesture() {
    Gest.clear();
  }

  function nameGesture(name) {
    var num;

    if (Gest.enough && name.length > 0) {
      dbug && C.log(Gest);
      num = Reads.addGesture(name, Gest);
      drawText(`“${name}” added. Number of “${name}s” defined: ${num}.`);
      resetGesture();
    }
  }

  function previewData(result) {
    // overlay segment colors
    Render.drawGest(Gest, {
      rotate: 1,
      opacity: 0.5,
    });

    let guess = Reads.findCloud(result.name);
    guess.map(
      obj => Render.drawCloud(obj.points, {
        color: 'gray',
        opacity: 0.2,
      })
    );

    if (result.score > 0.5) {
      // redraw normalized
      Render.drawCloud(Gest.normal, {
        rotate: 1,
        opacity: 1,
      });
    }

    C.log(['draw Gesture/PointCloud', Gest.exportDrawn, Gest.exportPercent]);
  }

  function tryRecognize() {
    var result;

    if (Gest.enough) {
      result = Reads.recognize(Gest);
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
      dbug && previewData(result);
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
  function lineStart(x, y) {
    Down = true;
    x -= Render.box.x;
    y -= Render.box.y - U.getScrollY();

    clearCanvas();
    if (Gest.stroke) {
      Render.drawGest(Gest); // redraw current strokes
    }
    Gest.addPoint(x, y);
    drawText(`Recording stroke #${Gest.stroke + 1}...`);

    Render.newColor();
    Render.drawCirc(x, y, 8);
  }

  function lineDraw(x, y) {
    if (Down) {
      x -= Render.box.x;
      y -= Render.box.y - U.getScrollY();
      Gest.addPoint(x, y);
      drawConnectedPoint();
    }
  }

  function lineEnd(x, y) {
    Gest.addPoint(x, y);
    let pointString = Gest.endStroke();
    Render.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    dbug > 1 && C.log([`Stroke #${Gest.stroke} recorded`, pointString]);
    tryRecognize();
  }

  function playStroke(str) {
    let arr = reader.strokePoints(str);
    let [first, last] = [arr[0], arr[arr.length - 1]];

    lineDraw(first.X, first.Y);
    arr.forEach(point => lineDraw(point.X, point.Y));
    lineEnd(last.X, last.Y);
  }

  function testdraw(arg) {
    if (U.undef(arg)) {
      Reads.clouds.map(obj => Render.drawCloud(obj.points));
    } else if (typeof arg === 'number') {
      Render.drawCloud(Reads.clouds[arg].points);
    } else if (typeof arg === 'string') {
      playStroke(arg);
    }
  }

  //
  // Click Events
  //
  function loadData() {
    $('.js-init').hide();
    initData(updateCount);
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

  // ================ BINDINGS ======================

  function downEvent(evt) {
    Dom.normTouch(evt);
    if (evt.button === 2) {
      clearCanvas();
      resetGesture();
    } else {
      lineStart(evt.clientX, evt.clientY);
    }
  }

  function moveEvent(evt) {
    Dom.normTouch(evt);
    lineDraw(evt.clientX, evt.clientY);
  }

  function upEvent(evt) {
    Dom.normTouch(evt);
    if (Down) {
      lineEnd(evt.clientX, evt.clientY);
    }
  }

  function initTool() {
    var $win = $(Render.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Render.size($win.width(), $win.height() - 60);
    resetGesture();
    clearCanvas();
  }

  function init(canvas) {
    Api.gest = Gest = gesture.make();
    Api.reads = Reads = reader.make();
    Api.render = Render = renderer(canvas, Df);

    var $window = $(window);
    var $canvas = $(canvas);

    function bindHanders() {
      $window.on('resize', _.debounce(initTool, 333));
      $canvas.on('mousedown.pdollar touchstart.pdollar', downEvent);
      $canvas.on('mousemove.pdollar touchmove.pdollar', _.throttle(moveEvent, 33));
      $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', upEvent);

      $('.overlay').on('click.pdollar', hideOverlay);
      $('.js-clear-stroke').on('click.pdollar', initTool);
      $('.js-init').on('click.pdollar', loadData);
      $('.js-check').on('click.pdollar', openTrainer);
      $('.js-choice').on('mousedown.pdollar', assignGesture);
    }

    if (dbug) {
      loadData(); // load gestures
    }
    bindHanders();
    initTool();
    updateCount();

    Api.init = () => true; // only used once
  }

  Api = {
    init,
    Df,
    U,
    Reader: reader,
    gest: null,
    reads: null,
    render: null,
    testdraw,
  };

  return Api;
});

/*

*/
