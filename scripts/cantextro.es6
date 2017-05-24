/*globals */

define(['jquery', 'util'], function ($, U) {

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

  function Cantextro(canvas, Df) {
    var box, cxt; // global variables

    box = getCanvasRect(canvas); // canvas rect on page
    cxt = canvas.getContext('2d');

    const defaults = function () {
      $.extend(cxt, Df);
      return cxt;
    };
    const clear = function () {
      defaults();
      fillAll();
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
      var color = `rgb(${U.rand(0, 200)}, ${U.rand(0, 200)}, ${U.rand(0, 200)})`;
      cxt.strokeStyle = color;
      cxt.fillStyle = color;
    };

    $.extend(cxt, Df, {
      box,
      defaults,
      clear,
      drawCirc,
      fillAll,
      fillCirc,
      newColor,
    });

    return cxt;
  }

  return Cantextro;
});

/*

*/
