/*globals */
// APP.ES6
/*

  USE: singleton
  - constructor is api

 */
define(['jquery', 'lodash', 'lib/util', 'lib/locstow', 'dom', 'gesture', 'renderer', 'trigger',
], function ($, _, U, LS, D, Gesture, Renderer, Trigger) {
  const NOM = 'App';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 1,
    imports: {
      $, _, U, D, Gesture, Renderer, Trigger,
    },
  };
  const EL = {
    body: 'body',
    btnChoose: '.js-choice',
    btnClear: '.js-clear-stroke',
    btnInit: '.js-init',
    btnLoad: '.js-load',
    btnSave: '.js-save',
    btnTrain: '.js-train',
    overlay: '.overlay',
    txtCount: '.js-gesture-count',
  };

  // - - - - - - - - - - - - - - - - - -
  // GLOBAL VARS
  //
  let Gest; // point array for current stroke(s)
  let Rend; // canvas toolkit
  let Down = false;

  // - - - - - - - - - - - - - - - - - -
  // DOM OPS
  //
  function updateCount() {
    let current = Gest.reader.count;
    let unsaved = current - LS.load(NOM).length;
    unsaved = unsaved ? `(${unsaved} new)` : '';
    EL.txtCount.text(`${current} ${unsaved}`);
  }

  function hideOverlay() {
    D.hideOverlay();
    updateCount();
  }

  // - - - - - - - - - - - - - - - - - -
  // CONTEXT OPS
  //
  function drawText(str) {
    if (API.dbug) Rend.setMessage(str, 'darkgray');
  }

  function clearCanvas() {
    Rend.defaults().fillAll();
    drawText('Canvas cleared');
    updateCount();
    EL.btnTrain.hide();
    EL.btnClear.hide();
  }

  // - - - - - - - - - - - - - - - - - -
  // DATA OPS
  //
  function initData() {
    Gest.reader.clear();
    // 'data/alphabet', 'data/gestures', 'data/numbers'
    require(['data/rawbert'], function (...arr) {
      arr.map(Gest.reader.processData);
      updateCount();
    });
  }

  function assignData(name) {
    if (U.undef(name)) {
      alert('Unknown gesture chosen.');
    } else {
      name = name.toString();
      nameGesture(name);
      hideOverlay();
    }
  }

  function loadData() {
    Gest.reader.clear();
    let arr = LS.load(API.name) || [];
    arr.forEach(o => Gest.reader.readNew(o));
  }

  function saveData() {
    LS.save(API.name, Gest.reader.clouds.map(o => o.source));
    C.log(API.name, 'saved gestures');
  }

  // - - - - - - - - - - - - - - - - - -
  // RECOG OPS
  //
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
    let matches = Gest.reader.findCloud(result.name);

    if (result.score > 0.1) {
      // overlay drawn with segment colors
      Rend.drawGest(Gest, {
        cycle: 1,
        opacity: 0.5,
      });
      // show guessed template
      if (result.score) matches.map(
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
      result = Gest.guess;
      if (result.score > 0.1) {
        result.gesture = Gest;
        $.publish('recog-' + result.name, result);
      }
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
      if (API.dbug) previewData(result);
    } else {
      drawText('Not enough data');
    }
    return result;
  }

  function tweakXY(x, y) {
    x -= Rend.box.x;
    y -= Rend.box.y - W.pageYOffset;
    return [x, y];
  }

  // - - - - - - - - - - - - - - - - - -
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
    EL.btnTrain.show();
    EL.btnClear.show();
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

  function clickInit() {
    initData();
    EL.btnInit.hide();
    EL.btnLoad.show();
    EL.btnSave.show();
  }

  function clickAssign(evt) {
    let name = evt.target.dataset.name;
    assignData(name);
    EL.btnLoad.show();
    EL.btnSave.show();
  }

  function clickLoad() {
    loadData();
    clearCanvas();
    EL.btnInit.show();
    EL.btnLoad.hide();
  }

  function clickSave() {
    saveData();
    clearCanvas();
    EL.btnSave.hide();
  }

  function clickTrainer() {
    const result = tryRecognize();
    Rend.drawBounds(Gest.limits);
    if (result) {
      D.showOverlay(result);
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
    let out = (evt.type === 'mouseout' && evt.toElement);
    if (out && out.localName !== 'html') return;
    if (Down) {
      lineEnd(evt.clientX, evt.clientY);
    }
  }

  function clickClear() {
    const $win = $(Rend.canvas.ownerDocument.defaultView);

    $win[0].scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
    Rend.size($win.width(), $win.height() - 60);
    resetGesture();
    clearCanvas();
  }

  function init(canvas) {
    API.Gest = Gest = Gesture.new();
    API.Rend = Rend = Renderer.new(canvas);
    $.reify(EL);
    EL.window = $(window);
    EL.canvas = $(canvas);

    function bindHanders() {
      EL.window.on('resize', _.debounce(clickClear, 333));
      EL.canvas.on('mousedown.drwbrt touchstart.drwbrt', downEvent);
      EL.canvas.on('mousemove.drwbrt touchmove.drwbrt', _.throttle(moveEvent, 16));
      EL.canvas.on('mouseup.drwbrt mouseout.drwbrt touchend.drwbrt', upEvent);

      EL.overlay.on('click.drwbrt', hideOverlay);
      EL.btnClear.on('click.drwbrt', clickClear);
      EL.btnInit.on('click.drwbrt', clickInit);
      EL.btnLoad.on('click.drwbrt', clickLoad);
      EL.btnSave.on('click.drwbrt', clickSave);
      EL.btnTrain.on('click.drwbrt', clickTrainer);
      EL.btnChoose.on('mousedown.drwbrt', clickAssign);

      $.subscribe('recog-star', Trigger.makeStar);
      $.subscribe('recog-square', Trigger.makeSquare);

    }

    if (API.dbug) clickLoad(); // load gestures
    bindHanders();
    clickClear();
    updateCount();

    API.init = () => true; // only used once
  }

  U.expando(API, {
    init,
    Gest: null,
    Rend: null,
    clickSave,
    clickLoad,
    testdraw: function (arg) {
      if (U.undef(arg)) {
        Gest.reader.clouds.map(obj => Rend.drawCloud(obj.points));
      } else if (typeof arg === 'number') {
        Rend.drawCloud(Gest.reader.clouds[arg].points);
      } else if (typeof arg === 'string') {
        playStroke(arg);
      }
    },
    backup: function () {
      API.name = 'App2';
      clickSave();
      API.name = NOM;
    },
    restore: function () {
      API.name = 'App2';
      clickLoad();
      API.name = NOM;
      clickSave();
    },
  });
  return API;
});
/*



*/
