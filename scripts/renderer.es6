// RENDERER.ES6
/*

decorates a Canvas context instance


INSTANCE
  recognize:    defer to pdollar.Recognizer method

*/
define(['jquery', 'lib/util', 'box',
], function ($, U, Box) {
  let dbug = 1;
  const W = window;
  const C = W.console;
  const D = {
    font: '20px impact',
    fillStyle: 'silver',
    lineWidth: 3,
    strokeStyle: 'gray',
  };

  const normo = (n, m) => (n + 1) * m / 2;
  const rando = () => `rgb(${U.rand(50,250)},${U.rand(50,250)},${U.rand(50,250)})`;

  function Renderer(canvas, cfg = D) {
    let api = canvas.getContext('2d');
    let colors = {
      index: 0,
      limit: 4,
      array: ['red', 'green', 'blue', 'yellow'],
      next: () => colors.array[colors.index++ % colors.limit],
    };
    let box = Box.make(canvas);
    let off = box.offset(4);

    const normpoint = o => ({
      X: normo(o.X, box.w) / off.slices + off.x,
      Y: normo(o.Y, box.h) / off.slices + off.y,
    });

    const defaults = function () {
      $.extend(api, cfg); // reset
      box.update();
      off.reset();
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
    const drawRect = function (box) {
      api.strokeRect(box.x, box.y, box.w, box.h);
      return api;
    };
    const drawBounds = function (limits) {
      api.drawRect(Box.calc(limits));
      return api;
    };
    const fillAll = function () {
      api.fillRect(0, 0, box.w, box.h);
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
      cfg.cycle && (color = colors.next());

      api.strokeStyle = color;
      api.fillStyle = color;
      return api;
    };
    const setMessage = function (str, bkgr) {
      api.fillStyle = bkgr;
      api.fillRect(0, box.h - 20, box.w, box.h);
      api.fillStyle = 'black';
      api.fillText(str, 10.5, box.h - 2);
      api.fillStyle = 'white';
      api.fillText(str, 11, box.h - 2.5);
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
      off.advance();
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
      $, U, Box,
      dbug,
      box,
      off,
      connectPoints,
      defaults,
      drawCirc,
      drawCloud,
      drawGest,
      drawRect,
      drawBounds,
      fillAll,
      fillCirc,
      newColor,
      setMessage,
      size,
    });

    return api;
  }

  return {
    make: Renderer,
  };
});

/*

*/
