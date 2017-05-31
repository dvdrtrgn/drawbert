/*globals */

define(['lodash', 'pdollar'], function (_, PDollar) {
  let dbug = 0;
  const C = window.console;
  const makePoint = (arr) => new PDollar.Point(...arr);

  function joinTwos(all) {
    let arr = [];
    while (all.length) arr.push(all.splice(0, 2));
    return arr;
  }

  function strokePoints(str, idx) {
    const all = joinTwos(str.split(/\s*,?\s*/g).map(Number));
    return all.map(arr => makePoint([...arr, idx + 1]));
  }

  function readNew(arg) {
    let arr = arg.map(strokePoints); // flatten
    return _.flatten(arr);
  }

  function extend(obj) {

    Object.defineProperties(obj, {
      addGesture: {
        value: obj.addGesture,
      },
      count: {
        get: () => obj.clouds.length,
      },
      lastCloud: {
        get: () => obj.clouds[obj.count - 1],
      },
      makePoint: {
        value: makePoint,
      },
      readGesture: {
        value: (arg) => {
          const name = arg.shift();
          const gest = [name, readNew(arg)];
          obj.addGesture(...gest);
          return [gest, obj.lastCloud];
        },
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
