/*globals */

define(['lib/pdollar', 'reader',
], function (PDollar, Reader) {
  let dbug = 0;

  const Name = 'Gesture';
  const W = window;
  const C = W.console;
  const deQuo = (str) => str.replace(/(-?\d+,-?\d+,)/g, `$1 `);
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);
  const round0 = (n, f = 1, d = 1, a = 0) => Math.round(n * f) / d + a;
  const rounds = (num) => Math.abs(num) > 1 ? num : round0(num, 50, 1, 50);

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

  function extend(api) {
    let strokeNum = 0;
    let strokeArr = [];
    let reader = Reader.make();

    Object.defineProperties(api.__proto__, {
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
      bank: {
        get: () => reader,
      },
      enough: {
        get: () => api.length > 5,
      },
      from: {
        get: () => api[api.length - 2],
      },
      normal: {
        get: () => PDollar.normalizePoints(api),
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
      //
      stroke: {
        get: () => strokeNum,
      },
      to: {
        get: () => api[api.length - 1],
      },
    });
  }

  function Construct() {
    const api = [];

    extend(api);
    dbug && C.log(Name, 'invoke util', api);

    return api;
  }

  return {
    make: Construct,
  };
});

/*

*/
