/*globals */

define(['pdollar',
], function (PDollar) {
  let dbug = 0;

  const C = window.console;
  const Name = 'Gesture';
  const deQuo = (str) => str.replace(/(\d+,\d+,)/g, `$1 `);
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);

  const makeJSON = (arr) => deQuo(JSON.stringify(arr));
  const toStrings = (arr) => arr.map(makeJSON);
  const toString = (arr) => reQuo(toStrings(arr).join(',\n'));
  const toCode = (arr) => `\n${toString(arr.slice(1))},\n`;

  function convert(arr) {
    let read = [];
    arr.forEach(function (e) {
      const i = e.ID;
      read[i] = read[i] || [];
      read[i].push(e.X, e.Y);
    });
    return read;
  }

  function extend(api) {
    let strokeNum = 0;
    let strokeArr = [];

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
      export: {
        get: () => toCode(convert(api)),
      },
      endStroke: {
        value: function () {
          let arr = strokeArr.join();
          strokeArr = [];
          strokeNum += 1;
          return arr;
        },
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
      stroke: {
        get: () => strokeNum,
      },
      to: {
        get: () => api[api.length - 1],
      },
    });
  }

  const Construct = function () {
    var api = [];

    extend(api);
    dbug && C.log(Name, 'invoke util', api);

    return api;
  };

  return {
    make: Construct,
  };
});

/*

*/
