// READER.ES6
/*

CLASS
  make:         Construct
  strokePoints: parse stroke string

INSTANCE
  addGesture:   defer to pdollar.Recognizer method
  count:        how many clouds?
  findCloud:    search for name string
  lastCloud:    what was last loaded?
  processData:  take an array of arrays
  makePoint:    defer to pdollar.Point constructor
  readGesture:  parse array of strings [name, stroke, stroke,...]
  readLegacy:   parse array of arrays
  recognize:    defer to pdollar.Recognizer method

*/

define(['lodash', 'pdollar',
], function (_, PDollar) {
  let dbug = 0;
  const C = window.console;
  const makePoint = (arr) => new PDollar.Point(...arr);
  const readStrokes = (arg) => _.flatten(arg.map(strokePoints));

  function joinTwos(all) {
    let arr = [];
    while (all.length) arr.push(all.splice(0, 2));
    return arr;
  }

  function strokePoints(str, idx) {
    const splitstr = (str) => str.split(/\s*,\s*/g).map(Number);
    const all = joinTwos(splitstr(str));
    return all.map(arr => makePoint([...arr, idx + 1]));
  }

  function _readArrayForm(api, nom, arr) {
    // read old point arrays, [log name with stroke arrays]
    api.addGesture(nom, arr.map(api.makePoint));
  }

  function _readStringForm(api, arg) {
    const name = arg.shift();
    const gest = [name, readStrokes(arg)];
    api.addGesture(...gest);
    // return [gest, api.lastCloud];
  }

  function extend(api) {

    Object.defineProperties(api, {
      addGesture: {
        value: api.addGesture,
      },
      count: {
        get: () => api.clouds.length,
      },
      findCloud: {
        value: str => _.filter(api.clouds, {
          name: str,
        }),
      },
      lastCloud: {
        get: () => api.clouds[api.count - 1],
      },
      processData: {
        value: (data) => data.map(arr => api.readGesture(arr)),
      },
      makePoint: {
        value: makePoint,
      },
      readGesture: {
        value: (arg) => _readStringForm(api, arg),
      },
      readLegacy: {
        value: (nom, arr) => _readArrayForm(api, nom, arr),
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
    strokePoints,
  };
});

/*

*/
