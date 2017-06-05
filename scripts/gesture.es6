/*globals */

define(['pdollar',
], function (PDollar) {
  let dbug = 0;
  const C = window.console;

  function extend(api) {
    let strokeNum = 0;
    let strokeArr = [];

    Object.defineProperties(api.__proto__, {
      addPoint: {
        value: function (x, y) {
          api[api.length] = new PDollar.Point(x, y, strokeNum);
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
          strokeNum++;
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

    dbug && C.log('invoke gesture util', api);
    return api;
  };

  return {
    make: Construct,
  };
});

/*

*/
