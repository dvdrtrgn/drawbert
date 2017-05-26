/*globals */

define(['jquery', 'lodash', 'util', 'pdollar', 'cantextro',
], function ($, _, U, PDollar, Cantextro) {
  let dbug = 1;

  // global variables
  var Ctx;
  var Down = false;
  var Points = []; // point array for current stroke
  var Recog = new PDollar.Recognizer();
  var StrokeID = 0;
  var Trainings = 0;

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
      Ctx.setMessage(str, 'darkgray');
    }
  }

  function clearCanvas() {
    Ctx.clear();
    drawText('Canvas cleared');
  }

  function drawConnectedPoint(from, to) {
    Ctx.connectPoints(Points[from], Points[to]);
  }

  //
  // DOM OPS
  //
  function updateCount() {
    $('.js-gesture-count').text(Trainings);
  }

  function hideOverlay() {
    $('.overlay').addClass('hidden');
    updateCount();
  }

  function showOverlay(result) {
    var $confidence = $('.js-confidence');

    $('.overlay').removeClass('hidden');
    $('.js-guess').text(result.Name);

    $confidence.text(U.percent(result.Score) + '%');
    $confidence.removeClass('high low medium');

    if (result.Score > 0.8) {
      $confidence.addClass('high');
    } else if (result.Score < 0.2) {
      $confidence.addClass('low');
    } else {
      $confidence.addClass('medium');
    }
  }

  //
  // RECOG OPS
  //
  function initAlphabet() {
    if (window._initGestures) {
      Trainings += window._initGestures(PDollar.Point, Recog);
    }
    if (window._initAlphabet) {
      Trainings += window._initAlphabet(PDollar.Point, Recog);
    }
  }

  function addCustom(name) {
    var num;

    if (Points.length >= 10 && name.length > 0) {
      window.console.log(Points);
      num = Recog.AddGesture(name, Points);
      Trainings += 1;
      drawText(`'${name}' added. Number of '${name}'s defined: ${num}.`);
      StrokeID = 0; // signal to begin new gesture on next mouse-down
    }
  }

  function addSampleGesture(evt) {
    var target = evt.target;
    var name = target.dataset.name;

    while (U.undef(name) && target.parentNode !== null) {
      target = target.parentNode;
      name = target.dataset.name;
    }

    if (!U.undef(name)) {
      addCustom(name);
      hideOverlay();
    } else {
      alert('Unknown gesture chosen.');
    }
  }

  function quickRecognize() {
    var result;

    if (Points.length > 9) {
      result = Recog.Recognize(Points);
      drawText(`Guess: “${result.Name}” @ ${U.percent(result.Score)}% confidence.`);
    } else {
      drawText('Not enough data');
    }
    return result;
  }

  function recognizeNow() {
    var result = quickRecognize();
    if (result) {
      showOverlay(result);
      StrokeID = 0; // signal to begin new gesture on next mouse-down
    }
  }

  //
  // Mouse Handlers
  //
  function mouseDownEvent(x, y) {
    Down = true;
    x -= Ctx.box.x;
    y -= Ctx.box.y - U.getScrollY();

    if (StrokeID === 0) { // starting a new gesture
      Points.length = 0;
      clearCanvas();
    }
    Points[Points.length] = new PDollar.Point(x, y, ++StrokeID);
    drawText(`Recording stroke #${StrokeID}...`);

    Ctx.newColor();
    Ctx.drawCirc(x, y, 8);
  }

  function mouseMoveEvent(x, y) {
    if (Down) {
      x -= Ctx.box.x;
      y -= Ctx.box.y - U.getScrollY();
      Points[Points.length] = new PDollar.Point(x, y, StrokeID); // append
      drawConnectedPoint(Points.length - 2, Points.length - 1);
    }
  }

  function mouseUpEvent(x, y) {
    Ctx.fillRect(x - 4, y - 4, 8, 8);
    Down = false;
    drawText(`Stroke #${StrokeID} recorded`);
    quickRecognize();
  }

  //
  // Click Events
  //
  function onClickInit() {
    $('.js-init').hide();
    initAlphabet();
    updateCount();
  }

  function onClickClearStrokes() {
    Points.length = 0;
    StrokeID = 0;
    clearCanvas();
  }

  function lineStart(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    if (evt.button === 2) {
      StrokeID = 0;
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

  function init(canvas) {
    Ctx = Cantextro(canvas, Df);

    var $window = $(window);
    var $canvas = $(canvas);

    function attachCanvas() {
      canvas.width = $window.width();
      canvas.height = $window.height() - 60;

      Ctx.clear();
      window.scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
      dbug && window.console.log(Ctx);
    }

    function bindHanders() {
      $window.on('resize', _.debounce(attachCanvas, 333));
      $canvas.on('mousedown.pdollar touchstart.pdollar', lineStart);
      $canvas.on('mousemove.pdollar touchmove.pdollar', lineDraw);
      $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', lineEnd);

      $('.overlay').on('click.pdollar', hideOverlay);
      $('.js-clear-stroke').on('click.pdollar', onClickClearStrokes);
      $('.js-init').on('click.pdollar', onClickInit);
      $('.js-check').on('click.pdollar', recognizeNow);
      $('.js-choice').on('mousedown.pdollar', addSampleGesture);
    }

    bindHanders();
    attachCanvas();
    updateCount();

    if (dbug) {
      onClickInit();
    }
  }

  return {
    init,
  };
});

/*

*/
