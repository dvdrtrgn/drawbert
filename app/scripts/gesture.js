//gesture.js
/*

  CHANGED: 2017-08-01
  IDEA: abstract gesture from pdollar

*/
import {W, C, U} from './_globs.js';
import Box from './libs/box.js';
import PDollar from './libs/pdollar.js';
import Reader from './libs/reader.js';
///
export default (function () {
  const NOM = 'Gesture';
  const API = {
    '': {
      NOM, closure: function () {},
    },
    dbug: 0,
  };
  const deQuo = (str) => str.replace(/(-?\d+,-?\d+,)/g, `$1 `);
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);

  const makeJSON = (arr) => deQuo(JSON.stringify(arr));
  const toStrings = (arr) => arr.map(makeJSON);
  const toString = (arr) => reQuo(toStrings(arr).join(',\n'));
  const toCode = (arr) => `\n${toString(arr.slice(1))},\n`;

  function calcLimits(arr) {
    const xs = arr.map(p => p.X);
    const ys = arr.map(p => p.Y);
    return {
      xmin: Math.min(...xs),
      ymin: Math.min(...ys),
      xmax: Math.max(...xs),
      ymax: Math.max(...ys),
    };
  }

  function extend(api) {
    let strokeNum = 0;
    let strokeArr = [];
    let reader = Reader.new();

    Object.defineProperties(api, { // HACK: .__proto__
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
      reader: {
        get: () => reader,
      },
      getCount: {
        value: () => reader.count,
      },
      enough: {
        get: () => api.length > PDollar.def.samples,
      },
      limits: {
        get: () => calcLimits(api),
      },
      bounds: {
        get: () => Box.calc(api.limits),
      },
      saveAs: {
        value: (nom) => reader.readOld(nom, api),
      },
      guess: {
        get: () => reader.recognize(api),
      },
      parsePointString: {
        value: (str) => Reader.strokePoints(str),
      },
      from: {
        get: () => api[api.length - 2],
      },
      normal: {
        get: () => api.length && PDollar.normalizePoints(api),
      },
      // Drawn Form
      drawn: {
        get: () => api,
      },
      exportDrawn: {
        get: () => toCode(Reader.convert(api.drawn)),
      },
      logDrawn: {
        get: () => C.log(api.exportDrawn),
      },
      // Percent Form
      exportPercent: {
        get: () => toCode(Reader.convert(api.normal)),
      },
      logPercent: {
        get: () => C.log(api.exportPercent),
      },
      logPercent64: {
        get: () => C.log(Reader.toBase64(api.exportPercent)),
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

  function Gesture() {
    const api = [];

    extend(api);
    if (API.dbug) C.log(NOM, 'invoke util', api);

    return api;
  }

  U.apiExpose(API, {
    U, Box, PDollar, Reader,
  }, {
    new: Gesture,
  });

  return API;
}());
/*



*/