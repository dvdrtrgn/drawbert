/*globals */

define(['jquery', 'lodash', 'lib/util', 'dom', 'gesture', 'renderer',
], function ($, _, U, Dom, gesture, renderer) {
  let dbug = 1;
  //
  // GLOBAL VARS
  //
  const C = window.console;
  let Gest; // point array for current stroke(s)
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

  //
  // RECOG OPS
  //
  function trainingTotal() {
    return Gest.reader.count;
  }

  function initData(cb) {
    require(['data/alphabet', 'data/gestures'], function (...arr) {
      arr.map(Gest.reader.processData);
      cb && cb();
    });
  }

  function resetGesture() {
    Gest.clear();
  }

  function nameGesture(name) {
    if (Gest.enough && name.length > 0) {
      dbug && C.log(Gest);
      let idx = Gest.saveAs(name);
      drawText(`“${name}” added. Number of “${name}s” defined: ${idx}.`);
      resetGesture();
    }
  }

  function previewData(result) {
    let guess = Gest.reader.findCloud(result.name);

    if (result.score > 0.1) {
      // overlay drawn with segment colors
      Render.drawGest(Gest, {
        rotate: 1,
        opacity: 0.5,
      });
      // show guessed template
      if (result.score) guess.map(
        obj => Render.drawCloud(obj.points, {
          color: 'gray',
          opacity: 0.2,
        })
      );
      // redraw normalized
      if (result.score < 0.5) {
        Render.drawCloud(Gest.normal, {
          rotate: 1,
          opacity: 1,
        });
      }
    }

    C.log('draw Gesture/PointCloud', [Gest.exportDrawn, Gest.exportPercent]);
  }

  function tryRecognize() {
    let result;

    if (Gest.enough) {
      result = Gest.guess();
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
      dbug && previewData(result);
    } else {
      drawText('Not enough data');
    }
    return result;
  }

  //
  // Mouse Handlers
  //
  function lineStart(x, y) {
    Down = true;
    x -= Render.box.x;
    y -= Render.box.y - Dom.getScrollY();

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
      y -= Render.box.y - Dom.getScrollY();
      Gest.addPoint(x, y);
      Render.connectPoints(Gest.from, Gest.to);
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
    let arr = Gest.parsePointString(str);
    let [first, last] = [arr[0], arr[arr.length - 1]];

    lineStart(first.X, first.Y);
    arr.forEach(point => lineDraw(point.X, point.Y));
    lineEnd(last.X, last.Y);
  }

  // ================ BINDINGS ======================

  function clickTrainer() {
    const result = tryRecognize();
    if (result) {
      Dom.showOverlay(result);
    }
  }

  function clickLoad() {
    $('.js-init').hide();
    initData(updateCount);
  }

  function clickAssign(evt) {
    const name = $(evt.target).data('name');

    if (U.undef(name)) {
      alert('Unknown gesture chosen.');
    } else {
      nameGesture(name);
      hideOverlay();
    }
  }

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

  function clickInit() {
    const $win = $(Render.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Render.size($win.width(), $win.height() - 60);
    resetGesture();
    clearCanvas();
  }

  function init(canvas) {
    Api.gest = Gest = gesture.make();
    Api.render = Render = renderer(canvas, Df);

    const $window = $(window);
    const $canvas = $(canvas);

    function bindHanders() {
      $window.on('resize', _.debounce(clickInit, 333));
      $canvas.on('mousedown.drwbrt touchstart.drwbrt', downEvent);
      $canvas.on('mousemove.drwbrt touchmove.drwbrt', _.throttle(moveEvent, 16));
      $canvas.on('mouseup.drwbrt mouseout.drwbrt touchend.drwbrt', upEvent);

      $('.overlay').on('click.drwbrt', hideOverlay);
      $('.js-clear-stroke').on('click.drwbrt', clickInit);
      $('.js-init').on('click.drwbrt', clickLoad);
      $('.js-check').on('click.drwbrt', clickTrainer);
      $('.js-choice').on('mousedown.drwbrt', clickAssign);
    }

    if (dbug) {
      clickLoad(); // load gestures
    }
    bindHanders();
    clickInit();
    updateCount();

    Api.init = () => true; // only used once
  }

  Api = {
    init, Df, U,
    gest: null,
    render: null,
    testdraw: function (arg) {
      if (U.undef(arg)) {
        Gest.reader.clouds.map(obj => Render.drawCloud(obj.points));
      } else if (typeof arg === 'number') {
        Render.drawCloud(Gest.reader.clouds[arg].points);
      } else if (typeof arg === 'string') {
        playStroke(arg);
      }
    },
  };

  return Api;
});

/*

*/
