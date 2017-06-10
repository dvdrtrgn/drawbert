// READER.ES6
/*

decorates a PDollar Recognizer instance

CLASS
  make:         Construct
  joinTwos:     break array into pairs
  strokePoints: parse stroke string

INSTANCE
  addGesture:   defer to pdollar.Recognizer method
  count:        how many clouds?
  findCloud:    search for name string
  lastCloud:    what was last loaded?
  makePoint:    defer to pdollar.Point constructor
  processData:  take an array of arrays
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

  function _readPointsArray(api, nom, arr) {
    // read old point arrays, [log name with stroke arrays]
    api.addGesture(nom, arr.map(api.makePoint));
  }

  function _readStrokesArray(api, arg) {
    api.addGesture(arg.shift(), readStrokes(arg));
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
      makePoint: {
        value: makePoint,
      },
      processData: {
        value: (data) => data.map(arr => api.readGesture(arr)),
      },
      readGesture: {
        value: (arg) => _readStrokesArray(api, arg),
      },
      readLegacy: {
        value: (nom, arr) => _readPointsArray(api, nom, arr),
      },
      recognize: {
        value: api.recognize,
      },
    });
  }

  function Construct() {
    const api = new PDollar.Recognizer();

    extend(api);
    dbug && C.log('invoke reader util', api);

    return api;
  }

  return {
    make: Construct,
    joinTwos,
    strokePoints,
  };
});

/*

*/
