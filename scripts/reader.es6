/*globals */

define(['pdollar',
], function (PDollar) {
  let dbug = 0;
  const C = window.console;

  function extend(obj) {

    Object.defineProperties(obj, {
      addGesture: {
        value: obj.addGesture,
      },
      count: {
        get: () => obj.clouds.length,
      },
      makePoint: {
        value: (arr) => new PDollar.Point(...arr),
      },
      recognize: {
        value: obj.recognize,
      },
    });
  }

  const Construct = function () {
    var api = new PDollar.Recognizer();

    extend(api);

    dbug && C.log('invoke reader util', api);
    return api;
  };

  return {
    make: Construct,
  };
});

/*

*/
