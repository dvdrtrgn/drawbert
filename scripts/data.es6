/*globals */

define(['jquery', 'util'], function () {
  var History = [];
  const C = window.console;
  const Name = 'Data';
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);

  function Construct() {
    var _name;
    var _orig;
    var _read;

    function readNew(arg) {
      arg = arg || ['asterisk', '325,499,417,557', '417,499,325,557', '371,486,371,571'];
      return arg;
    }

    function readOld(name, orig) {
      _name = name;
      _orig = orig;
      _read = [name];

      orig.forEach(function (e) {
        var [x, y, i] = [...e];
        _read[i] = _read[i] || [];
        _read[i].push(x, y);
      });
      return this;
    }

    function toCode() {
      return `drt.data.ondeck = [
  ${toString()},
];`; // note addedd trailing comma!
    }

    function toString() {
      var arr = toStrings();
      return reQuo(arr.join(',\n  '));
    }

    function toStrings() {
      return _read.map(makeJSON);
    }

    function makeJSON(x) {
      let str = JSON.stringify(x || _read);
      return reQuo(str);
    }

    function save() {
      C.log(Name, 'saving', _name); // toCode()
      History.push(_read);
    }

    var api = {
      ondeck: 0,
      History,
      readOld,
      makeJSON,
      save,
      toCode,
      toString,
      toStrings,
    };

    Object.defineProperties(api, {
      name: {
        get: () => _name,
      },
      orig: {
        get: () => _orig,
      },
      read: {
        get: () => _read,
      },
      ondeck: {
        set: readNew,
      },
    });

    return api;
  }

  return {
    make: Construct,
  };
});

/*

*/
