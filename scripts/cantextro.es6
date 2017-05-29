/*globals */

define(['jquery', 'util'], function ($, U) {
  const C = window.console;

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

  function expando(obj, ...args) {
    var exp = $.extend({}, ...args);
    U.checkCollision(obj, exp);
    $.extend(obj, exp);
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
    const connectPoints = function (from, to) {
      api.beginPath();
      api.moveTo(from.X, from.Y);
      api.lineTo(to.X, to.Y);
      api.closePath();
      api.stroke();
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
    const setMessage = function (str, bkgr) {
      api.fillStyle = bkgr;
      api.fillRect(0, api.box.height - 20, api.box.width, api.box.height);
      api.fillStyle = 'black';
      api.fillText(str, 10.5, api.box.height - 2);
      api.fillStyle = 'white';
      api.fillText(str, 11, api.box.height - 2.5);
    };
    const size = function (w, h) {
      api.canvas.width = w;
      api.canvas.height = h;
    };

    expando(api, Df, {
      clear,
      connectPoints,
      defaults,
      drawCirc,
      fillAll,
      fillCirc,
      newColor,
      setMessage,
      size,
    });

    return api;
  }

  return Cantextro;
});

/*

*/
