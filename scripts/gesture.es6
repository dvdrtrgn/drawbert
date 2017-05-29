/*globals */

define(['jquery', 'util', 'pdollar',
], function ($, U, PDollar) {
  let dbug = 0;
  const C = window.console;

  function extend(obj) {
    let stroke = 0;

    Object.defineProperties(obj, {
      addPoint: {
        value: function (x, y) {
          obj[obj.length] = new PDollar.Point(x, y, stroke);
        },
      },
      clear: {
        value: function () {
          obj.length = 0;
          stroke = 0;
        },
      },
      enough: {
        get: () => obj.length > 9,
      },
      from: {
        get: () => obj[obj.length - 2],
      },
      to: {
        get: () => obj[obj.length - 1],
      },
      stroke: {
        get: () => stroke,
      },
      nextStroke: {
        value: function () {
          stroke++;
          return obj;
        },
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
