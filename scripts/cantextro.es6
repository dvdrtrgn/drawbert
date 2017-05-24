/*globals */

define(['jquery', 'util'], function ($, U) {

  function getRect(context) {
    let canvas = context.canvas;
    let w = canvas.width;
    let h = canvas.height;
    let cx = canvas.offsetLeft;
    let cy = canvas.offsetTop;

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
    let api = canvas.getContext('2d');

    const defaults = function () {
      $.extend(api, Df); // reset
      api.box = getRect(api);
      return api;
    };
    const clear = function () {
      defaults();
      fillAll();
    };
    const drawCirc = function (x = 100, y = 100, rad = 10) {
      api.beginPath();
      api.arc(x, y, rad, 0, 2 * Math.PI, false);
      api.stroke();
    };
    const fillAll = function () {
      api.fillRect(0, 0, api.box.width, api.box.height);
    };
    const fillCirc = function (x = 100, y = 100, rad = 10) {
      api.beginPath();
      api.arc(x, y, rad, 0, 2 * Math.PI, false);
      api.fill();
    };
    const newColor = function () {
      let color = `rgb(${U.rand(50, 150)}, ${U.rand(50, 150)}, ${U.rand(50, 150)})`;
      api.strokeStyle = color;
      api.fillStyle = color;
    };

    $.extend(api, Df, {
      defaults,
      clear,
      drawCirc,
      fillAll,
      fillCirc,
      newColor,
    });

    return api;
  }

  return Cantextro;
});

/*

*/
