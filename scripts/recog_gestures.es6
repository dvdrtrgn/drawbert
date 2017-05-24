/*globals $, PDollar, _initAlphabet */

const rand = (lo, hi) => Math.floor((hi - lo + 1) * Math.random()) + lo;
const round = (n, d) => Math.round(n * (d = Math.pow(10, d))) / d;
const undef = (x) => typeof x === 'undefined';
const percent = (num) => (round(num, 2) * 100) | 0;

(function () {
  let dbug = 1;

  var _isDown, _points, _strokeID, rcg, cxt, box; // global variables
  var _trainingCount = 0;

  const defaults = function () {
    $.extend(cxt, Df);
    return cxt;
  };
  const clear = function () {
    defaults();
    fillAll();
    drawText('Canvas cleared');
  };
  const drawCirc = function (x = 100, y = 100, rad = 10) {
    cxt.beginPath();
    cxt.arc(x, y, rad, 0, 2 * Math.PI, false);
    cxt.stroke();
  };
  const fillAll = function () {
    cxt.fillRect(0, 0, box.width, box.height);
  };
  const fillCirc = function (x = 100, y = 100, rad = 10) {
    cxt.beginPath();
    cxt.arc(x, y, rad, 0, 2 * Math.PI, false);
    cxt.fill();
  };
  const newColor = function () {
    var color = `rgb(${rand(0, 200)}, ${rand(0, 200)}, ${rand(0, 200)})`;
    cxt.strokeStyle = color;
    cxt.fillStyle = color;
  };
  const Df = {
    font: '20px impact',
    fillStyle: 'silver',
    lineWidth: 3,
    strokeStyle: 'black',
    defaults,
    clear,
    drawCirc,
    fillAll,
    fillCirc,
    newColor,
  };

  // ================ BINDINGS ======================

  $(function () {
    _points = []; // point array for current stroke
    _strokeID = 0;
    _isDown = false;
    rcg = new PDollar.Recognizer();

    var $canvas = $('canvas').first();
    var $window = $(window);
    var canvas = $canvas[0];

    $window.on('resize', attachCanvas);

    function attachCanvas() {
      canvas.width = $window.width();
      canvas.height = $window.height() - 50;
      box = getCanvasRect(canvas); // canvas rect on page
      cxt = canvas.getContext('2d');

      defaults().clear();
      window.scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
      dbug && window.console.log(cxt, rcg);
    }

    $canvas.on('mousedown.pdollar touchstart.pdollar', lineStart);
    $canvas.on('mousemove.pdollar touchmove.pdollar', lineDraw);
    $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', lineEnd);

    $('.overlay').on('click.pdollar', hideOverlay);
    $('.js-clear-stroke').on('click.pdollar', onClickClearStrokes);
    $('.js-init').on('click.pdollar', onClickInit);
    $('.js-check').on('click.pdollar', recognizeNow);
    $('.js-choice').on('mousedown.pdollar', addSampleGesture);

    attachCanvas();
    updateCount();
    if (dbug) {
      onClickInit();
    }
  });

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

  function getCanvasRect(canvas) {
    var w = canvas.width;
    var h = canvas.height;
    var cx = canvas.offsetLeft;
    var cy = canvas.offsetTop;

    while (canvas.offsetParent !== null) {
      canvas = canvas.offsetParent;
      cx += canvas.offsetLeft;
      cy += canvas.offsetTop;
    }
    return {
      x: cx,
      y: cy,
      width: w,
      height: h,
    };
  }

  function getScrollY() {
    var scrollY = 0;

    if (!undef(document.body.parentElement)) {
      scrollY = document.body.parentElement.scrollTop; // IE
    } else if (!undef(window.pageYOffset)) {
      scrollY = window.pageYOffset; // FF
    }
    return scrollY;
  }
  //
  // Mouse Events
  //
  function mouseDownEvent(x, y) {
    _isDown = true;
    x -= box.x;
    y -= box.y - getScrollY();

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
      x -= box.x;
      y -= box.y - getScrollY();
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
      cxt.fillRect(0, box.height - 20, box.width, box.height);
      cxt.fillStyle = 'black';
      cxt.fillText(str, 10.5, box.height - 2);
      cxt.fillStyle = 'white';
      cxt.fillText(str, 11, box.height - 2.5);
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

    $confidence.text(percent(result.Score) + '%');
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
      drawText(`Guess: “${result.Name}” @ ${percent(result.Score)}% confidence.`);
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

    while (undef(name) && target.parentNode !== null) {
      target = target.parentNode;
      name = target.dataset.name;
    }

    if (!undef(name)) {
      addCustom(name);
      hideOverlay();
    } else {
      alert('Unknown gesture chosen.');
    }
  }

}());

/*

*/
