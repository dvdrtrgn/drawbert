/*globals */

define(['lodash', 'pdollar'], function (_, PDollar) {
  let dbug = 0;
  const C = window.console;
  const makePoint = (arr) => new PDollar.Point(...arr);
  const readArrayString = (str) => str.split(/\s*,\s*/g).map(Number);

  function joinTwos(all) {
    let arr = [];
    while (all.length) arr.push(all.splice(0, 2));
    return arr;
  }

  function strokePoints(str, idx) {
    const all = joinTwos(readArrayString(str));
    return all.map(arr => makePoint([...arr, idx + 1]));
  }

  function readNew(arg) {
    let arr = arg.map(strokePoints); // flatten
    return _.flatten(arr);
  }

  function extend(api) {

    Object.defineProperties(api, {
      addGesture: {
        value: api.addGesture,
      },
      count: {
        get: () => api.clouds.length,
      },
      lastCloud: {
        get: () => api.clouds[api.count - 1],
      },
      makePoint: {
        value: makePoint,
      },
      readGesture: {
        value: (arg) => {
          const name = arg.shift();
          const gest = [name, readNew(arg)];
          api.addGesture(...gest);
          return [gest, api.lastCloud];
        },
      },
      readLegacy: {
        value: function (nom, arr) {
          dbug && window.drt.data.convert(nom, arr).log();
          api.addGesture(nom, arr.map(api.makePoint));
        },
      },
      recognize: {
        value: api.recognize,
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
