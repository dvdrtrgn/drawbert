//database.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: couple localstorage to gesture data

*/
/*eslint indent:off, */
import {W, C, $} from './_globs.js';
import U from './libs/util.js';
import LS from './libs/locstow.js';
///
export default (function () {
  const NOM = 'Database';
  const API = {
    '': {
      NOM, closure: function () {},
    },
    dbug: 1,
  };
  const DF = {
    data: 'data/rawbert', // 'data/alphabet', 'data/gestures', 'data/numbers'
    key: `LS-${Date.now()}`,
  };

  /**
   * Make an LS/Gesture helper
   * @param  {Gesture} Gest [from Gesture.es6]
   * @param  {String}  Key  [a key token for data]
   * @return {Object}       [custom object]
   */
  function make(Gest, Key) {
    if (!Gest) throw 'Must pass in a gesture object';
    Key = Key || DF.Key;

    var api = {
      init: function (key) {
        key = key || Key;
        if (!LS.load(key)) LS.save(key, []);
        return LS.load(key);
      },
      getCount: function () {
        return (LS.load(Key) || api.init()).length;
      },
      loadDefaults: function (cb) {
        Gest.reader.clear();
        fetch('scripts/' + DF.data + '.js')
        .then((resp) => resp.text())
        .then(function (raw) {
          var arr = [eval(raw)];
          arr.map(Gest.reader.processData);
          cb && cb();
        });
      },
      saveGests: function (key) {
        key = key || Key;
        if (API.dbug) C.log(key, 'saving gestures');
        LS.save(key, Gest.reader.clouds.map(o => o.source));
      },
      loadGests: function (key) {
        key = key || Key;
        Gest.reader.clear();
        let arr = LS.load(key) || api.init();
        arr.forEach(o => Gest.reader.readNew(o));
      },
      backupGests: function () {
        api.saveGests(`${Key}-bak`);
      },
      restoreGests: function () {
        api.loadGests(`${Key}-bak`);
        api.saveGests();
      },
    };
    return api;
  }

  U.apiExpose(API, {
    $, U, LS,
  }, {
    DF,
    new: make,
  });

  return API;
}());
/*



*/
