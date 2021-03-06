/*globals */
// RENDERER.ES6
/*

  USE: decorates a Canvas context instance


  INSTANCE
    recognize:    defer to pdollar.Recognizer method

*/
define(['jquery', 'util', 'box',
], function ($, U, Box) {
  const NOM = 'Renderer';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 1,
    imports: {
      $, U, Box,
    },
  };
  const D = {
    font: '20px impact',
    fillStyle: 'silver',
    lineWidth: 3,
    strokeStyle: 'gray',
  };

  const normo = (n, m) => (n + 1) * m / 2;
  const rando = () => `rgb(${U.rand(50,250)},${U.rand(50,250)},${U.rand(50,250)})`;

  function copyStyle(api) {
    return {
      fillStyle: api.fillStyle,
      font: api.font,
      globalAlpha: api.globalAlpha,
      lineWidth: api.lineWidth,
      strokeStyle: api.strokeStyle,
    };
  }

  function pasteStyle(api, cfg) {
    $.extend(api, cfg);
  }

  function Renderer(canvas, cfg = D) {
    let api = canvas.getContext('2d');
    let colors = {
      index: 0,
      limit: 4,
      array: ['red', 'green', 'blue', 'yellow'],
      next: () => colors.array[colors.index++ % colors.limit],
    };
    let box = Box.new(canvas);
    let off = box.offset(4);

    const normpoint = o => ({
      X: normo(o.X, box.w) / off.scaling + off.x,
      Y: normo(o.Y, box.h) / off.scaling + off.y,
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
      let prev = api.fillStyle;
      api.fillStyle = 'yellow';
      api.drawRect(Box.calc(limits));
      api.fillStyle = prev;
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
      window.setTimeout(() => api.globalAlpha = 1, 4);
    };

    function drawCloud(arr, cfg) {
      let old = copyStyle(api);
      off.advance();
      arr.reduce(function (last, next) {
        if (last.ID === next.ID) { // do not connect strokes
          newColor(cfg);
          connectPoints(normpoint(last), normpoint(next));
        }
        return next;
      });
      pasteStyle(api, old);
    }

    function drawGest(arr, cfg) {
      let old = copyStyle(api);
      arr.reduce(function (last, next) {
        if (last.ID === next.ID) { // points from same stroke
          newColor(cfg);
          connectPoints(last, next);
        }
        return next;
      });
      pasteStyle(api, old);
    }

    U.expando(api, cfg, {
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

  U.expando(API, {
    new: Renderer,
  });
  return API;
});
/*



*/
