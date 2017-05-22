'use strict'; /*globals $, PDollar, _initAlphabet */

var rand = function rand(lo, hi) {return Math.floor((hi - lo + 1) * Math.random()) + lo;};
var round = function round(n, d) {return Math.round(n * (d = Math.pow(10, d))) / d;};
var undef = function undef(x) {return typeof x === 'undefined';};

(function () {
  var dbug = 1;

  var _isDown, _points, _strokeID, rcg, cxt, box; // global variables
  var _trainingCount = 0;

  var defaults = function defaults() {
    $.extend(cxt, Df);
    return cxt;
  };
  var clear = function clear() {
    defaults();
    fillAll();
    drawText('Canvas cleared');
  };
  var drawCirc = function drawCirc() {var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;var rad = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    cxt.beginPath();
    cxt.arc(x, y, rad, 0, 2 * Math.PI, false);
    cxt.stroke();
  };
  var fillAll = function fillAll() {
    cxt.fillRect(0, 0, box.width, box.height);
  };
  var fillCirc = function fillCirc() {var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;var rad = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    cxt.beginPath();
    cxt.arc(x, y, rad, 0, 2 * Math.PI, false);
    cxt.fill();
  };
  var newColor = function newColor() {
    var color = 'rgb(' + rand(0, 200) + ', ' + rand(0, 200) + ', ' + rand(0, 200) + ')';
    cxt.strokeStyle = color;
    cxt.fillStyle = color;
  };
  var Df = {
    font: '16px monospace',
    fillStyle: 'gray',
    lineWidth: 3,
    strokeStyle: 'black',
    defaults: defaults,
    clear: clear,
    drawCirc: drawCirc,
    fillAll: fillAll,
    fillCirc: fillCirc,
    newColor: newColor };


  // ================ BINDINGS ======================

  $(function () {
    _points = []; // point array for current stroke
    _strokeID = 0;
    _isDown = false;
    rcg = new PDollar.Recognizer();

    var $canvas = $('canvas').first();
    var $window = $(window);
    var canvas = $canvas[0];

    canvas.width = $window.width();
    canvas.height = $window.height() - 50;
    box = getCanvasRect(canvas); // canvas rect on page

    cxt = canvas.getContext('2d');
    defaults().clear();
    window.console.log(cxt, rcg);

    function halt(evt, nom) {
      evt.preventDefault();
      evt.stopPropagation(nom); // hack to delint unused arg
      // console.log(nom, 'clientX = ', evt.clientX, 'clientY = ', evt.clientY);
    }
    $canvas.on('mousedown.pdollar touchstart.pdollar', function (evt) {
      halt(evt, 'starting');
      if (evt.originalEvent.changedTouches) {
        evt = evt.originalEvent.changedTouches[0];
      }
      mouseDownEvent(evt.clientX, evt.clientY);
    });
    $canvas.on('mousemove.pdollar touchmove.pdollar', function (evt) {
      halt(evt, 'moving');
      if (evt.originalEvent.changedTouches) {
        evt = evt.originalEvent.changedTouches[0];
      }
      mouseMoveEvent(evt.clientX, evt.clientY);
    });
    $canvas.on('mouseup.pdollar mouseout.pdollar touchend.pdollar', function (evt) {
      halt(evt, 'ending');
      if (evt.originalEvent.changedTouches) {
        evt = evt.originalEvent.changedTouches[0];
      }
      if (_isDown) {
        mouseUpEvent(evt.clientX, evt.clientY);
      }
    });

    $('.overlay').on('click.pdollar', hideOverlay);
    $('.js-clear-stroke').on('click.pdollar', onClickClearStrokes);
    $('.js-init').on('click.pdollar', onClickInit);
    $('.js-check').on('click.pdollar', recognizeNow);
    $('.js-choice').on('mousedown.pdollar', addSampleGesture);

    updateCount();
    if (dbug) {
      onClickInit();
    }
    window.scrollTo(0, 0); // Make sure that the page is not accidentally scrolled.
  });

  // ================ HELPERS ======================

  function initAlphabet() {
    PDollar.initDefaultGestures(rcg);
    _trainingCount += 6;
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
      height: h };

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

    if (_strokeID === 0) {// starting a new gesture
      _points.length = 0;
      cxt.clear();
    }
    _points[_points.length] = new PDollar.Point(x, y, ++_strokeID);
    drawText('Recording stroke #' + _strokeID + '...');

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
    drawText('Stroke #' + _strokeID + ' recorded');
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
      cxt.fillStyle = 'silver';
      cxt.fillRect(0, box.height - 20, box.width, box.height);
      cxt.fillStyle = 'black';
      cxt.fillText(str, 11, box.height - 5);
    }
  }

  function addCustom(name) {
    var num;

    if (_points.length >= 10 && name.length > 0) {
      window.console.log(_points);
      num = rcg.AddGesture(name, _points);
      _trainingCount += 1;
      drawText('\'' + name + '\' added. Number of \'' + name + '\'s defined: ' + num + '.');
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

    $confidence.text(round(result.Score, 2));
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
      drawText('Result: ' + result.Name + ' (' + round(result.Score, 2) + ')');
    } else {
      drawText('Not enough data');
    }
  }

  function recognizeNow() {
    var result;

    if (_points.length > 9) {
      result = rcg.Recognize(_points);
      showOverlay(result);
      drawText('Result: ' + result.Name + ' (' + round(result.Score, 2) + ')');
    } else {
      drawText('Not enough data');
    }
    _strokeID = 0; // signal to begin new gesture on next mouse-down
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

})();

/*
      
      */