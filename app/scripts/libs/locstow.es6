/*globals */
define([], function () {
  const W = window;
  const C = W.console;
  const LS = W.localStorage;
  const NOM = 'Locstow';

  const unicodecharacters = (x) => decodeURIComponent(escape(x)); // utf8bytes
  const utf8bytes = (x) => unescape(encodeURIComponent(x)); // unicodecharacters

  if (!C || !LS) throw ('I give up');

  function loadDataFrom(key) {
    try {
      return JSON.parse(LS.getItem(key) || '');
    } catch (e) {
      return null;
    }
  }

  function saveDataIn(key, value) {
    try {
      LS.setItem(key, JSON.stringify(value));
      C.log(NOM, 'saved key:' + key, printCurrentStorage());
    } catch (e) {
      if (isQuotaExceeded(e)) C.log('No more storage space', e);
    }
  }

  function clearRecordFrom(key) {
    try {
      LS.removeItem(key);
    } catch (e) {
      C.log(NOM, 'no support.');
    }
  }

  function clearAllDataFrom(keyPrefix = '') {
    try {
      for (let key in LS) {
        if (key.indexOf(keyPrefix) === 0) LS.removeItem(key);
      }
      C.log(NOM, 'deleted all' + (keyPrefix ? 'prefixed:' + keyPrefix : ''));
    } catch (e) {
      C.log(NOM, 'no support.');
    }
  }

  function getAllKeysFrom(keyPrefix = '') {
    const arr = [];
    try {
      for (let key in LS) {
        if (key.indexOf(keyPrefix) === 0) arr.push(key);
      }
    } catch (e) {
      C.log(NOM, 'no support.');
    }
    return arr;
  }

  function isQuotaExceeded(e) {
    let quotaExceeded = false;
    if (e) {
      if (e.code) {
        switch (e.code) {
        case 22: // Default error code in case of exceeded quota
          quotaExceeded = true;
          break;
        case 1014: // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') quotaExceeded = true;
          break;
        }
      } else if (e.number === -2147024882) quotaExceeded = true; // Internet Explorer 8
    }
    return quotaExceeded;
  }

  function printCurrentStorage() {
    if (LS.remainingSpace && LS.remainingSpace > 0) { // Internet Explorer
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

});
