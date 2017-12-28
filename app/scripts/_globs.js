//_globs.js
/*

  CHANGED: 2017-12-28

*/
import U from './libs/util.js';
import LS from './libs/locstow.js';

const W = window;
const C = console;
const $ = W.$;
const _ = W._;

export {
  W, C, U, LS,
  $, _,
};

Object.assign(W, {W, C, U, $, _});
