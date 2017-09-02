///
//reader.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: decorate a PDollar Recognizer instance

  CLASS
    new:          inst Reader
    joinTwos:     break array into pairs
    strokePoints: parse stroke string

  INSTANCE
    addGesture:   defer to Recognizer.addGesture method
    count:        how many clouds?
    findCloud:    search for name string
    lastCloud:    what was last loaded?
    processData:  take an array of arrays
    readNew:      parse array of strings [name, stroke, [stroke,...]]
    readOld:      parse [name] and array of point arrays [[X,Y,ID]...]
    recognize:    defer to Recognizer.recognize method

*/
define(['lodash', 'util', 'lib/pdollar',
], function (_, U, PDollar) {
  const NOM = 'Reader';
  const W = window;
  const C = W.console;
  const API = {
    '': {
      NOM, closure: function () {},
    },
    dbug: 0,
  };
  const makePoint = (arr) => new PDollar.Point(...arr);
  const readStrokes = (arg) => _.flatten(arg.map(strokePoints));
  const round0 = (n, f = 1, d = 1, a = 0) => Math.round(n * f) / d + a;
  const rounds = (num) => Math.abs(num) > 1 ? num : round0(num, 50, 1, 50);
  const toBase64 = (str) => `\n${btoa(str)}`.replace(/(.{1,78})/g, '$1\n');
  const fromBase64 = (str) => atob(str);

  function points2strokes(arr) {
    let read = [];
    arr.forEach(function (e) {
      const i = e.ID;
      read[i] = read[i] || [];
      read[i].push(rounds(e.X), rounds(e.Y));
    });
    return read;
  }

  function dumpHex(clouds) {
    let all = [];
    clouds.forEach(cloud => {
      let gest = points2strokes(cloud.points);
      gest[0] = cloud.name;
      all.push(gest.map(String));
    });
    return toBase64(JSON.stringify(all));
  }

  function suckHex(api, hex) {
    let json = fromBase64(hex);
    let data = JSON.parse(json);
    return api.processData(data);
  }

  function joinTwos(all) {
    let arr = [];
    while (all.length) arr.push(all.splice(0, 2));
    return arr;
  }

  function strokePoints(str, idx) {
    str = str || '';
    const splitstr = (str) => str.split(/\s*,\s*/g).map(Number);
    const all = joinTwos(splitstr(str));
    return all.map(arr => makePoint([...arr, idx + 1]));
  }

  function bindSource(api, arr) {
    api.lastCloud.source = arr;
    if (API.dbug) C.log('bindSource', api.lastCloud);
  }

  // read old point arrays
  function _readPoints(api, nom, arrs) {
    let num = api.addGesture(nom, arrs);
    let arg = points2strokes(arrs);
    arg[0] = nom;
    bindSource(api, arg.map(String));
    return num;
  }
  // read new stroke arrays
  function _readStrokes(api, arg) {
    if (!arg) return;
    var arr = arg.concat();
    let num = api.addGesture(arr.shift(), readStrokes(arr));
    bindSource(api, arg);
    return num;
  }

  function extend(api) {

    Object.defineProperties(api, {
      addGesture: {
        value: api.addGesture,
      },
      clear: {
        value: () => api.clouds.length = 0, // start clean
      },
      count: {
        get: () => api.clouds.length,
      },
      findCloud: {
        value: str => _.filter(api.clouds, {
          name: str,
        }),
      },
      dumpClouds: {
        value: () => dumpHex(api.clouds),
      },
      suckClouds: {
        value: (data) => data && suckHex(api, data),
      },
      lastCloud: {
        get: () => api.clouds[api.count - 1],
      },
      processData: {
        value: (data) => data.map(arr => api.readNew(arr)),
      },
      readNew: {
        value: (arg) => _readStrokes(api, arg),
      },
      readOld: {
        value: (nom, arr) => _readPoints(api, nom, arr),
      },
      recognize: {
        value: api.recognize,
      },
    });
  }

  function Reader() {
    const api = new PDollar.Recognizer();

    extend(api);
    if (API.dbug) C.log('invoke reader util', api);

    return api;
  }

  U.apiExpose(API, arguments, {
    new: Reader,
    convert: points2strokes,
    joinTwos,
    strokePoints,
    toBase64,
    fromBase64,
  });
  return API;
});
/*



*/
