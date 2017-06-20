/*globals */
// GESTURE.ES6
/*

  USE:

*/
define(['lib/util', 'lib/pdollar', 'reader',
], function (U, PDollar, Reader) {
  const NOM = 'Gesture';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 0,
    imports: {
      U, PDollar, Reader,
    },
  };
  const deQuo = (str) => str.replace(/(-?\d+,-?\d+,)/g, `$1 `);
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);
  const round0 = (n, f = 1, d = 1, a = 0) => Math.round(n * f) / d + a;
  const rounds = (num) => Math.abs(num) > 1 ? num : round0(num, 50, 1, 50);
  const toBase64 = (str) => `\n${btoa(str)}`.replace(/(.{1,78})/g, '$1\n');
  const fromBase64 = (str) => atob(str);

  const makeJSON = (arr) => deQuo(JSON.stringify(arr));
  const toStrings = (arr) => arr.map(makeJSON);
  const toString = (arr) => reQuo(toStrings(arr).join(',\n'));
  const toCode = (arr) => `\n${toString(arr.slice(1))},\n`;

  function convert(arr) {
    let read = [];
    arr.forEach(function (e) {
      const i = e.ID;
      read[i] = read[i] || [];
      read[i].push(rounds(e.X), rounds(e.Y));
    });
    return read;
  }

  function calcLimits(arr) {
    const xs = arr.map(p => p.X);
    const ys = arr.map(p => p.Y);
    return {
      xmin: Math.min(...xs),
      ymin: Math.min(...ys),
      xmax: Math.max(...xs),
      ymax: Math.max(...ys),
    };
  }

  function extend(api) {
    let strokeNum = 0;
    let strokeArr = [];
    let reader = Reader.new();

    Object.defineProperties(api, { // .__proto__
      addPoint: {
        value: function (x, y) {
          api[api.length] = new PDollar.Point(x, y, strokeNum + 1); // projected ID
          strokeArr.push([x, y].join());
        },
      },
      clear: {
        value: function () {
          api.length = 0;
          strokeArr = [];
          strokeNum = 0;
        },
      },
      endStroke: {
        value: function () {
          let arr = strokeArr.join();
          strokeArr = [];
          strokeNum += 1;
          return arr;
        },
      },
      reader: {
        get: () => reader,
      },
      enough: {
        get: () => api.normal.length > 5,
      },
      limits: {
        get: () => calcLimits(api),
      },
      saveAs: {
        value: (name) => reader.addGesture(name, api),
      },
      guess: {
        value: () => reader.recognize(api),
      },
      parsePointString: {
        value: (str) => Reader.strokePoints(str),
      },
      from: {
        get: () => api[api.length - 2],
      },
      normal: {
        get: () => api.length && PDollar.normalizePoints(api),
      },
      // Drawn Form
      drawn: {
        get: () => api,
      },
      exportDrawn: {
        get: () => toCode(convert(api.drawn)),
      },
      logDrawn: {
        get: () => C.log(api.exportDrawn),
      },
      // Percent Form
      exportPercent: {
        get: () => toCode(convert(api.normal)),
      },
      logPercent: {
        get: () => C.log(api.exportPercent),
      },
      logPercent64: {
        get: () => C.log(toBase64(api.exportPercent)),
      },
      //
      stroke: {
        get: () => strokeNum,
      },
      to: {
        get: () => api[api.length - 1],
      },
    });
  }

  function Gesture() {
    const api = [];

    extend(api);
    if (API.dbug) C.log(NOM, 'invoke util', api);

    return api;
  }

  U.expando(API, {
    new: Gesture,
    fromBase64: fromBase64,
  });
  return API;
});
/*



*/
