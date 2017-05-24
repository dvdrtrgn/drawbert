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

  // ================ BINDINGS ======================

  function init(canvas) {
    var $window = $(window);
    var $canvas = $(canvas);

    function attachCanvas() {
      canvas.width = $window.width();
      canvas.height = $window.height() - 50;
      cxt = Cantextro(canvas, Df);

      cxt.defaults().clear();
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

  // ================ HELPERS ======================

  function lineStart(evt) {
    evt.preventDefault(evt);
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
    }
    if (evt.button === 2) {
      recognizeNow();
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

  function initAlphabet() {
    if (window._initGestures) {
      _trainingCount += window._initGestures(PDollar.Point, rcg);
    }
    if (window._initAlphabet) {
      _trainingCount += window._initAlphabet(PDollar.Point, rcg);
    }
  }

  function getScrollY() {
    var scrollY = 0;

    if (!U.undef(document.body.parentElement)) {
      scrollY = document.body.parentElement.scrollTop; // IE
    } else if (!U.undef(window.pageYOffset)) {
      scrollY = window.pageYOffset; // FF
    }
    return scrollY;
  }
  //
  // Mouse Events
  //
  function mouseDownEvent(x, y) {
    _isDown = true;
    x -= cxt.box.x;
    y -= cxt.box.y - getScrollY();

    if (_strokeID === 0) { // starting a new gesture
      _points.length = 0;
      cxt.clear();
    }
    _points[_points.length] = new PDollar.Point(x, y, ++_strokeID);
    drawText(`Recording stroke #${_strokeID}...`);

    cxt.newColor();
    cxt.drawCirc(x, y, 8);
  }

  function mouseMoveEvent(x, y) {
    if (_isDown) {
      x -= cxt.box.x;
      y -= cxt.box.y - getScrollY();
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

  function drawConnectedPoint(from, to) {
    cxt.beginPath();
    cxt.moveTo(_points[from].X, _points[from].Y);
    cxt.lineTo(_points[to].X, _points[to].Y);
    cxt.closePath();
    cxt.stroke();
  }

  function drawText(str) {
    if (dbug) {
      cxt.fillStyle = 'darkgray';
      cxt.fillRect(0, cxt.box.height - 20, cxt.box.width, cxt.box.height);
      cxt.fillStyle = 'black';
      cxt.fillText(str, 10.5, cxt.box.height - 2);
      cxt.fillStyle = 'white';
      cxt.fillText(str, 11, cxt.box.height - 2.5);
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

  function onClickInit() {
    $('.js-init').hide();
    initAlphabet();
    updateCount();
  }

  function onClickClearStrokes() {
    _points.length = 0;
    _strokeID = 0;
    cxt.clear();
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

  function updateCount() {
    $('.js-gesture-count').text(_trainingCount);
  }

  function hideOverlay() {
    $('.overlay').addClass('hidden');
    updateCount();
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

  return {
    init,
  };
});

/*

*/
