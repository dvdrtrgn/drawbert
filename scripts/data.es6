/*globals */

define(['jquery', 'util'], function () {
  const C = window.console;
  var History = [];

  function Construct() {
    var _name;
    var _orig;
    var _read;

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

    function toString() {
      var arr = _read.map(String);
      return arr.join('|');
    }

    function save() {
      History.push(_read);
    }

    var api = {
      History,
      readOld,
      save,
      toString,
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
    });

    return api;
  }

  return {
    make: Construct,
  };
});

/*

*/
