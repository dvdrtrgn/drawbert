/*globals */

define(['jquery', 'lodash', 'util', 'pdollar', 'cantextro',
], function ($, _, U, PDollar, Cantextro) {
  let dbug = 1;

  // global variables
  var cxt;
  var rcg = new PDollar.Recognizer();
  var _trainingCount = 0;
  var _points = []; // point array for current stroke
  var _strokeID = 0;
  var _isDown = false;

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
      cxt.setMessage(str, 'darkgray');
    }
  }

  function clearCanvas() {
    cxt.clear();
    drawText('Canvas cleared');
  }

  function drawConnectedPoint(from, to) {
    cxt.connectPoints(_points[from], _points[to]);
  }

  //
  // DOM OPS
  //
  function updateCount() {
    $('.js-gesture-count').text(_trainingCount);
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
      _trainingCount += window._initGestures(PDollar.Point, rcg);
    }
    if (window._initAlphabet) {
      _trainingCount += window._initAlphabet(PDollar.Point, rcg);
    }
  }

  function addCustom(name) {
    var num;

    if (_points.length >= 10 && name.length > 0) {
      window.console.log(_points);
      num = rcg.AddGesture(name, _points);
      _trainingCount += 1;
      drawText(`'${name}' added. Number of '${name}'s defined: ${num}.`);
      _strokeID = 0; // signal to begin new gesture on next mouse-down
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

    if (_points.length > 9) {
      result = rcg.Recognize(_points);
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
      _strokeID = 0; // signal to begin new gesture on next mouse-down
    }
  }

  //
  // Mouse Handlers
  //
  function mouseDownEvent(x, y) {
    _isDown = true;
    x -= cxt.box.x;
    y -= cxt.box.y - U.getScrollY();

    if (_strokeID === 0) { // starting a new gesture
      _points.length = 0;
      clearCanvas();
    }
    _points[_points.length] = new PDollar.Point(x, y, ++_strokeID);
    drawText(`Recording stroke #${_strokeID}...`);

    cxt.newColor();
    cxt.drawCirc(x, y, 8);
  }

  function mouseMoveEvent(x, y) {
    if (_isDown) {
      x -= cxt.box.x;
      y -= cxt.box.y - U.getScrollY();
      _points[_points.length] = new PDollar.Point(x, y, _strokeID); // append
      drawConnectedPoint(_points.length - 2, _points.length - 1);
    }
  }

  function mouseUpEvent(x, y) {
    cxt.fillRect(x - 4, y - 4, 8, 8);
    _isDown = false;
    drawText(`Stroke #${_strokeID} recorded`);
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
    _points.length = 0;
    _strokeID = 0;
    clearCanvas();
  }

  function lineStart(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    if (evt.button === 2) {
      _strokeID = 0;
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
    if (_isDown) {
      mouseUpEvent(evt.clientX, evt.clientY);
    }
  }

  // ================ BINDINGS ======================

  function init(canvas) {
    cxt = Cantextro(canvas, Df);

    var $window = $(window);
    var $canvas = $(canvas);

    function attachCanvas() {
      canvas.width = $window.width();
      canvas.height = $window.height() - 60;

      cxt.clear();
      window.scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
      dbug && window.console.log(cxt);
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
