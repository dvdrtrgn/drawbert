/*globals */

define(['jquery', 'util',
], function ($, U) {
  let dbug = 1;
  const C = window.console;

  const normo = (n, m) => (n + 1) * m / 2;
  const rando = () => `rgb(${U.rand(50,250)},${U.rand(50,250)},${U.rand(50,250)})`;

  function getRect(canvas) {
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

  function Renderer(canvas, cfg) {
    let api = canvas.getContext('2d');
    let colors = {
      index: 0,
      limit: 4,
      array: ['red', 'green', 'blue', 'yellow'],
      next: () => colors.array[colors.index++ % colors.limit],
    };

    const normpoint = o => ({
      X: normo(o.X, api.box.width),
      Y: normo(o.Y, api.box.height),
    });

    const defaults = function () {
      $.extend(api, cfg); // reset
      api.box = getRect(api.canvas);
      return api;
    };
    const connectPoints = function (from, to) {
      api.beginPath();
      api.moveTo(from.X, from.Y);
      api.lineTo(to.X, to.Y);
      api.closePath();
      api.stroke();
      return api;
    };
    const drawCirc = function (x = 100, y = 100, rad = 10) {
      api.beginPath();
      api.arc(x, y, rad, 0, 2 * Math.PI, false);
      api.stroke();
      return api;
    };
    const fillAll = function () {
      api.fillRect(0, 0, api.box.width, api.box.height);
      return api;
    };
    const fillCirc = function (x = 100, y = 100, rad = 10) {
      api.beginPath();
      api.arc(x, y, rad, 0, 2 * Math.PI, false);
      api.fill();
      return api;
    };
    const newColor = function (cfg = {}) {
      let color;
      cfg.color && (color = cfg.color);
      cfg.opacity && goGhost(cfg.opacity);
      cfg.random && (color = rando());
      cfg.rotate && (color = colors.next());

      api.strokeStyle = color;
      api.fillStyle = color;
      return api;
    };
    const setMessage = function (str, bkgr) {
      api.fillStyle = bkgr;
      api.fillRect(0, api.box.height - 20, api.box.width, api.box.height);
      api.fillStyle = 'black';
      api.fillText(str, 10.5, api.box.height - 2);
      api.fillStyle = 'white';
      api.fillText(str, 11, api.box.height - 2.5);
      return api;
    };
    const size = function (w, h) {
      api.canvas.width = w;
      api.canvas.height = h;
      return api;
    };
    const goGhost = function (num) {
      api.globalAlpha = num;
      window.setTimeout(() => api.globalAlpha = 1, 0);
    };

    function drawCloud(arr, cfg) {
      arr.reduce(function (last, next) {
        if (last.ID === next.ID) { // do not connect strokes
          newColor(cfg);
          connectPoints(normpoint(last), normpoint(next));
        }
        return next;
      });
    }

    function drawGest(arr, cfg) {
      arr.reduce(function (last, next) {
        if (last.ID === next.ID) { // points from same stroke
          newColor(cfg);
          connectPoints(last, next);
        }
        return next;
      });
    }

    U.expando(api, cfg, {
      dbug,
      connectPoints,
      defaults,
      drawCirc,
      drawCloud,
      drawGest,
      fillAll,
      fillCirc,
      newColor,
      setMessage,
      size,
    });

    return api;
  }

  return Renderer;
});

/*

*/
