//lib/locstow.js
/*

  CHANGED: 2017-08-01
  IDEA: construct localstorage porters

*/
import {W, C} from '../_globs.js';
///
export default (function () {
  const NOM = 'Locstow';
  const LS = W.localStorage;

  const logerr = (e) => C.error(NOM, e);
  const unicodecharacters = (x) => decodeURIComponent(escape(x)); // utf8bytes
  const utf8bytes = (x) => unescape(encodeURIComponent(x)); // unicodecharacters

  if (!C || !LS) throw ('I give up');

  function loadDataFrom(key) {
    try {
      return JSON.parse(LS.getItem(key) || '');
    } catch (e) {
      return undefined;
    }
  }

  function saveDataIn(key, value) {
    try {
      LS.setItem(key, JSON.stringify(value));
      C.log(NOM, 'saved key:' + key, checkUsage());
    } catch (e) {
      logerr(e);
    }
  }

  function clearRecordFrom(key) {
    try {
      LS.removeItem(key);
    } catch (e) {
      logerr(e);
    }
  }

  function clearAllDataFrom(keyPrefix = '') {
    try {
      for (let key in LS) {
        if (key.indexOf(keyPrefix) === 0) LS.removeItem(key);
      }
      C.log(NOM, 'deleted all' + (keyPrefix ? 'prefixed:' + keyPrefix : ''));
    } catch (e) {
      logerr(e);
    }
  }

  function getAllKeysFrom(keyPrefix = '') {
    const arr = [];
    try {
      for (let key in LS) {
        if (key.indexOf(keyPrefix) === 0) arr.push(key);
      }
    } catch (e) {
      logerr(e);
    }
    return arr;
  }

  function checkUsage() {
    if (LS.remainingSpace && LS.remainingSpace > 0) { // MSIE
      let size = (LS.remainingSpace / 1024).toFixed(0);
      return `>>> Available Storage: ${size} KB`;
    } else {
      let size = (JSON.stringify(LS).length / 1024).toFixed(0);
      return `>>> Total Storage: ${size} KB`;
    }
  }

  function construct(prefix) {
    if (!prefix) throw ('Why create instance?');
    prefix += '-';

    return {
      load: (k) => loadDataFrom(prefix + k),
      save: (k, v) => saveDataIn(prefix + k, v),
      clearRecord: (k) => clearRecordFrom(k),
      clearAllData: () => clearAllDataFrom(prefix),
      getAllKeys: () => getAllKeysFrom(prefix),
    };

  }

  let K = (new Array(1023).fill('k').join(''));
  let M = (new Array(1023).fill(K).join(', '));

  return {
    '': {
      NOM, closure: function () {},
    },
    new: construct,
    load: loadDataFrom,
    save: saveDataIn,
    clearRecord: clearRecordFrom,
    clearAllData: clearAllDataFrom,
    getAllKeys: getAllKeysFrom,
    K, M,
    unicodecharacters,
    utf8bytes,
  };
}());
