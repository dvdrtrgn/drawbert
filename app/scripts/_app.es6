/*globals */
// APP.ES6
/*

  USE: singleton
  - constructor is api

 */
define(['jquery', 'lodash', 'lib/util', 'dom', 'gesture', 'renderer',
], function ($, _, U, D, Gesture, Renderer) {
  const NOM = 'App';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 1,
    imports: {
      $, _, U, D, Gesture, Renderer,
    },
  };
  //
  // GLOBAL VARS
  //
  let Gest; // point array for current stroke(s)
  let Rend; // canvas toolkit
  let Down = false;

  //
  // DOM OPS
  //
  function updateCount() {
    D.updateCount(trainingTotal());
  }

  function hideOverlay() {
    D.hideOverlay();
    updateCount();
  }

  //
  // CONTEXT OPS
  //
  function drawText(str) {
    if (API.dbug) Rend.setMessage(str, 'darkgray');
  }

  function clearCanvas() {
    Rend.defaults().fillAll();
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
    require(['data/alphabet', 'data/gestures', 'data/numbers'], function (...arr) {
      arr.map(Gest.reader.processData);
      if (cb) cb();
    });
  }

  function resetGesture() {
    Gest.clear();
  }

  function nameGesture(name) {
    if (Gest.enough && name.length > 0) {
      if (API.dbug) C.log(NOM, 'nameGesture', name, Gest);
      let idx = Gest.saveAs(name);
      drawText(`“${name}” added. Number of “${name}s” defined: ${idx}.`);
      resetGesture();
    }
  }

  function previewData(result) {
    let guess = Gest.reader.findCloud(result.name);

    if (result.score > 0.1) {
      // overlay drawn with segment colors
      Rend.drawGest(Gest, {
        cycle: 1,
        opacity: 0.5,
      });
      // show guessed template
      if (result.score) guess.map(
        obj => Rend.drawCloud(obj.points, {
          color: 'gray',
          opacity: 0.2,
        })
      );
      // redraw normalized
      if (result.score < 0.5) {
        Rend.drawCloud(Gest.normal, {
          cycle: 1,
          opacity: 1,
        });
      }
    }

    if (API.dbug > 1) C.log(NOM, 'previewData: pix/pct', {
      pix: Gest.exportDrawn,
      pct: Gest.exportPercent,
    });
  }

  function tryRecognize() {
    let result;

    if (Gest.enough) {
      result = Gest.guess();
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
      if (API.dbug) previewData(result);
    } else {
      drawText('Not enough data');
    }
    return result;
  }

  function tweakXY(x, y) {
    x -= Rend.box.x;
    y -= Rend.box.y - D.getScrollY();
    return [x, y];
  }

  //
  // Mouse Handlers
  //
  function lineStart(x, y) {
    Down = true;
    [x, y] = tweakXY(x, y);

    clearCanvas();
    if (Gest.stroke) {
      Rend.drawGest(Gest); // redraw current strokes
    }
    Gest.addPoint(x, y);
    drawText(`Recording stroke #${Gest.stroke + 1}...`);

    Rend.newColor();
    Rend.drawCirc(x, y, 8);
  }

  function lineDraw(x, y) {
    if (Down) {
      [x, y] = tweakXY(x, y);
      Gest.addPoint(x, y);
      Rend.connectPoints(Gest.from, Gest.to);
    }
  }

  function lineEnd(x, y) {
    [x, y] = tweakXY(x, y);
    Gest.addPoint(x, y);
    let pointString = Gest.endStroke();
    Rend.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    if (API.dbug > 1) C.log(NOM, 'lineEnd', [`Stroke #${Gest.stroke} recorded`, pointString]);
    tryRecognize();
    // C.log(Gest.exportPercent); // dump for snagging init data
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
    Rend.drawBounds(Gest.limits);
    if (result) {
      D.showOverlay(result);
    }
  }

  function clickLoad() {
    $('.js-init').hide();
    initData(updateCount);
  }

  function clickAssign(evt) {
    let name = evt.target.dataset.name;

    if (U.undef(name)) {
      alert('Unknown gesture chosen.');
    } else {
      name = name.toString();
      nameGesture(name);
      hideOverlay();
    }
  }

  function downEvent(evt) {
    evt = D.normTouch(evt);
    if (evt.button === 2) {
      clearCanvas();
      resetGesture();
    } else {
      lineStart(evt.clientX, evt.clientY);
    }
  }

  function moveEvent(evt) {
    evt = D.normTouch(evt);
    lineDraw(evt.clientX, evt.clientY);
  }

  function upEvent(evt) {
    evt = D.normTouch(evt);
    if (Down) {
      lineEnd(evt.clientX, evt.clientY);
    }
  }

  function clickInit() {
    const $win = $(Rend.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Rend.size($win.width(), $win.height() - 60);
    resetGesture();
    clearCanvas();
  }

  function init(canvas) {
    API.Gest = Gest = Gesture.new();
    API.Rend = Rend = Renderer.new(canvas);

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
      $('.js-train').on('click.drwbrt', clickTrainer);
      $('.js-choice').on('mousedown.drwbrt', clickAssign);
    }

    if (API.dbug) clickLoad(); // load gestures
    bindHanders();
    clickInit();
    updateCount();

    API.init = () => true; // only used once
  }

  U.expando(API, {
    init,
    Gest: null,
    Rend: null,
    testdraw: function (arg) {
      if (U.undef(arg)) {
        Gest.reader.clouds.map(obj => Rend.drawCloud(obj.points));
      } else if (typeof arg === 'number') {
        Rend.drawCloud(Gest.reader.clouds[arg].points);
      } else if (typeof arg === 'string') {
        playStroke(arg);
      }
    },
  });
  return API;
});
/*



*/
