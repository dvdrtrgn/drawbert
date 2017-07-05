/*globals */
// APP.ES6
/*

  USE: singleton
  - constructor is api

 */
define(['jquery', 'lodash', 'lib/util', 'lib/locstow', 'dom', 'gesture', 'renderer', 'trigger',
], function ($, _, U, LS, Dom, Gesture, Renderer, Trigger) {
  const NOM = 'Dbrt';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 1,
    gestKey: NOM + '-gest',
    imports: {
      $, _, U, Dom, Gesture, Renderer, Trigger,
    },
  };
  const EL = {
    body: 'body',
    section: 'section.canvas',
    options: '.option-template',
    btnChoose: '.js-choice',
    btnClear: '.js-clear-stroke',
    btnInit: '.js-init',
    btnLoad: '.js-load',
    btnSave: '.js-save',
    btnBackup: '.js-backup',
    btnRestore: '.js-restore',
    btnTrain: '.js-train',
    overlay: '.overlay',
    txtCount: '.js-gesture-count',
  };
  const spacer = Dom.makeNameSpacer(NOM);
  const bindon = Dom.bindNameSpacer(spacer, 'on');

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
    let unsaved = current - (LS.load(API.gestKey) || []).length;
    unsaved = unsaved ? `(${unsaved} new)` : '';
    EL.txtCount.text(`${current} ${unsaved}`);
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
    EL.btnClear.hide();
  }

  function raiseCanvas() {
    Dom.raise(EL.section);
  }

  function lowerCanvas() {
    Dom.lower(EL.section);
  }

  // - - - - - - - - - - - - - - - - - -
  // DATA OPS
  //
  function stockData() {
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
    }
  }

  function loadGests() {
    Gest.reader.clear();
    let arr = LS.load(API.gestKey) || [];
    arr.forEach(o => Gest.reader.readNew(o));
  }

  function saveGests() {
    LS.save(API.gestKey, Gest.reader.clouds.map(o => o.source));
    C.log(API.gestKey, 'saved gestures');
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
    raiseCanvas();
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
    lowerCanvas();
    [x, y] = tweakXY(x, y);
    Gest.addPoint(x, y);
    let pointString = Gest.endStroke();
    Rend.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    if (API.dbug > 1) C.log(NOM, 'lineEnd', [`Stroke #${Gest.stroke} recorded`, pointString]);
    tryRecognize();
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
    stockData();
    EL.btnInit.hide();
    EL.btnLoad.show();
    EL.btnSave.show();
  }

  function clickTrainer() {
    const result = tryRecognize();
    if (result) {
      Rend.drawBounds(Gest.limits);
    }
    Dom.showOverlay(result);
  }

  function closeTrainer() {
    updateCount();
    Dom.hideOverlay();
  }

  function clickAssign(evt) {
    let name = evt.target.dataset.name;
    assignData(name);
    closeTrainer();
    EL.btnLoad.show();
    EL.btnSave.show();
  }

  function clickLoad() {
    loadGests();
    clearCanvas();
    EL.btnInit.show();
    EL.btnLoad.hide();
  }

  function clickSave() {
    saveGests();
    clearCanvas();
    EL.btnSave.hide();
  }

  function clickBackup() {
    let bu = API.gestKey;
    API.gestKey = `${API.name}-gbak`;
    clickSave();
    API.gestKey = bu;
  }

  function clickRestore() {
    let bu = API.gestKey;
    API.gestKey = `${API.name}-gbak`;
    clickLoad();
    API.gestKey = bu;
    clickSave();
  }

  function downEvent(evt) {
    evt = Dom.normTouch(evt);
    if (evt.button === 2) {
      clearCanvas();
      resetGesture();
    } else {
      lineStart(evt.clientX, evt.clientY);
    }
  }

  function moveEvent(evt) {
    evt = Dom.normTouch(evt);
    lineDraw(evt.clientX, evt.clientY);
  }

  function upEvent(evt) {
    evt = Dom.normTouch(evt);
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
      bindon(EL.window, 'resize', _.debounce(clickClear, 333));
      bindon(EL.canvas, 'mousedown touchstart', downEvent);
      bindon(EL.canvas, 'mousemove touchmove', _.throttle(moveEvent, 16));
      bindon(EL.canvas, 'mouseup mouseout touchend', upEvent);

      bindon(EL.overlay, 'click', closeTrainer);
      bindon(EL.btnTrain, 'click', clickTrainer);
      bindon(EL.btnClear, 'click', clickClear);

      bindon(EL.btnInit, 'click', clickInit);
      bindon(EL.btnLoad, 'click', clickLoad);
      bindon(EL.btnSave, 'click', clickSave);
      bindon(EL.btnBackup, 'click', clickBackup);
      bindon(EL.btnRestore, 'click', clickRestore);
      bindon(EL.btnChoose, 'click', clickAssign);

      $.subscribe('recog-star', Trigger.makeStar);
      $.subscribe('recog-square', Trigger.makeSquare);

    }

    if (API.dbug) clickLoad(); // load gestures
    bindHanders();
    clickClear();
    updateCount();

    Dom.fillOptions();
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
