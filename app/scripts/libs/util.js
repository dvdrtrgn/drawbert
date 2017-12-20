//lib/util.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: base for util functions

*/
import {$, _} from '../_globs.js';
///
export default (function () {
  const NOM = 'Util';
  const rand = (lo, hi) => Math.floor((hi - lo + 1) * Math.random()) + lo;
  const round = (n, d) => Math.round(n * (d = Math.pow(10, d))) / d;
  const undef = (x) => typeof x === 'undefined';
  const percent = (num) => (round(num, 2) * 100) | 0;
  const collisions = (o, a) => a.filter(k => k in o && typeof o[k] === 'function');
  const noop = () => {};

  function allkeys(obj) {
    const arr = [];
    for (let i in obj) arr.push(i);
    return arr;
  }

  function apiExpose(api, args, etc) {
    var imports = Object.create(null);
    expando(api, etc);
    Object.values(args).forEach(function (e) {
      var nom = e[''];
      if (nom) {
        nom = (typeof nom === 'string') ? nom : nom.NOM;
      } else {
        nom = 'anon';
      }
      if (e === $) nom = 'jquery';
      if (e === _) nom = 'lodash';
      imports[nom] = e;
    });
    api[''].imports = imports;
  }

  function checkCollision(o1, o2) {
    const all = collisions(o1, allkeys(o2));
    if (all.length) throw Error(`collisions: ${all}`);
  }

  function expando(obj, ...args) {
    const exp = _.extend({}, ...args);
    checkCollision(obj, exp);
    _.extend(obj, exp);
  }

  function fastarrclone(arr) {
    let [i, o] = [arr.length, new Array(arr.length)];
    while (i--) o[i] = arr[i];
    return o;
  }

  function flattarr(arr) {
    let flat = (acc, x) => Array.isArray(x) ? x.reduce(flat, acc) : acc.push(x) && acc;
    return arr.reduce(flat, []);
  }

  return {
    '': {
      NOM, closure: function () {},
    },
    allkeys,
    apiExpose,
    checkCollision,
    expando,
    fastarrclone,
    flattarr,
    noop,
    percent,
    rand,
    round,
    undef,
  };
}());
