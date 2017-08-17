///
//_app.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: compose this heap
  NOTE: constructor is api
  FIXME: singleton

 */
define(['jquery', 'lodash', 'util', 'database', 'dom', 'gesture', 'renderer', 'trigger',
], function ($, _, U, Database, Dom, Gesture, Renderer, Trigger) {
  const NOM = 'Dbrt';
  const W = window;
  const C = W.console;
  const API = {
    __: NOM,
    dbug: 1,
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
  let Data; // keep settings across sessions
  let Gest; // point array for current stroke(s)
  let Rend; // canvas toolkit
  let Down = false;

  // - - - - - - - - - - - - - - - - - -
  // DOM OPS
  //
  function updateCount() {
    let current = Gest.getCount();
    let unsaved = current - Data.getCount();
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
    Rend.clear();
    updateCount();
    $(EL.btnClear).disable();
  }

  function raiseCanvas() {
    Dom.raise(EL.section);
  }

  function lowerCanvas() {
    Dom.lower(EL.section);
  }

  // - - - - - - - - - - - - - - - - - -
  // RECOG OPS
  //
  function resetGesture() {
    Gest.clear();
  }

  function nameGesture(name) {
    if (U.undef(name)) {
      return alert('Unknown gesture chosen.');
    }
    name = name.toString();
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
      if (result.score) matches.map(
        // show guessed template
        obj => Rend.drawCloud(obj.points, {
          color: 'gray',
          opacity: 0.2,
        })
      );
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
      drawText(`Guess: “${result.name}” @ ${U.percent(result.score)}% confidence.`);
      if (API.dbug) previewData(result);
      if (result.score > 0.1) {
        result.gesture = Gest;
        $.publish('recog.' + result.name, result);
      }
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
    raiseCanvas();

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
    Down = false;
    [x, y] = tweakXY(x, y);
    lowerCanvas();
    Gest.addPoint(x, y);
    let pointString = Gest.endStroke();
    Rend.fillRect(x - 4, y - 4, 8, 8);
    if (API.dbug > 1) C.log(NOM, 'lineEnd', [`Stroke #${Gest.stroke} recorded`, pointString]);
    tryRecognize();
    $(EL.btnClear).enable();
  }

  function playStroke(str) {
    let arr = Gest.parsePointString(str);
    let [first, last] = [arr[0], arr[arr.length - 1]];

    lineStart(first.X, first.Y);
    arr.forEach(point => lineDraw(point.X, point.Y));
    lineEnd(last.X, last.Y);
  }

  // ================ BINDINGS ======================

  function clickInit(evt) {
    evt.stopPropagation();
    if ($(this).is('.disabled')) return;
    Data.loadDefaults(updateCount);
    $(EL.btnInit).disable();
    $(EL.btnLoad, EL.btnSave).enable();
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
    nameGesture(name);
    closeTrainer();
    $(EL.btnLoad, EL.btnSave).enable();
  }

  function clickLoad(evt) {
    evt.stopPropagation();
    if ($(this).is('.disabled')) return;
    Data.loadGests();
    clearCanvas();
    $(EL.btnInit).enable();
    $(EL.btnLoad).disable();
  }

  function clickSave(evt) {
    evt.stopPropagation();
    if ($(this).is('.disabled')) return;
    Data.saveGests();
    clearCanvas();
    $(EL.btnSave).disable();
  }

  function clickBackup(evt) {
    evt.stopPropagation();
    Data.backupGests();
  }

  function clickRestore(evt) {
    evt.stopPropagation();
    Data.restoreGests();
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
    if ($(this).is('.disabled')) return;
    resetGesture();
    clearCanvas();
  }

  function init(canvas) {
    API.Gest = Gest = Gesture.new();
    API.Rend = Rend = Renderer.new(canvas);
    API.Data = Data = Database.new(Gest, `${NOM}-gest`);
    Dom.fillOptions();

    $.reify(EL);
    EL.window = $(window);
    EL.canvas = $(canvas);

    function bindHanders() {
      let _clickClear = _.debounce(clickClear, 333);
      let _moveEvent = _.throttle(moveEvent, 16);

      bindon(EL.window, 'resize', _clickClear);
      bindon(EL.canvas, 'mousedown', downEvent);
      bindon(EL.canvas, 'touchstart', downEvent);
      bindon(EL.canvas, 'mousemove', _moveEvent);
      bindon(EL.canvas, 'touchmove', _moveEvent);
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

      $.subscribe('recog', alert);
      $.subscribe('clear.all', clickClear);
      $.subscribe('clear.canvas', clearCanvas);
      $.subscribe('clear.gesture', resetGesture);
      $.subscribe('print.canvas', (a, b) => drawText(b));

      $.subscribe('recog.star', Trigger.makeStar);
      $.subscribe('recog.square', Trigger.makeSquare);
      $.subscribe('recog.paragraph', Trigger.makeParagraph);
    }

    bindHanders();
    clearCanvas();
    Data.loadGests();
    updateCount();

    API.init = () => true; // only used once
  }

  U.apiExpose(API, arguments, {
    Data: null,
    Gest: null,
    Rend: null,
    init,
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
