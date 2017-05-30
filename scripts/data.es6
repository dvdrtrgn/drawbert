/*globals */

define(['reader'], function () {
  const History = [];
  const C = window.console;
  const Name = 'Data';
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);

  function Construct() {
    let _name;
    let _orig;
    let _read;

    function load(name, orig) {
      _name = name;
      _orig = orig;
      _read = [name];

      orig.forEach(function (e) {
        const [x, y, i] = [...e];
        _read[i] = _read[i] || [];
        _read[i].push(x, y);
      });
      return this;
    }

    function toCode() {
      return `reader.readGesture = [
  ${toString()},
];`; // note added trailing comma!
    }

    function toString() {
      const arr = toStrings();
      return reQuo(arr.join(',\n  '));
    }

    function toStrings() {
      return _read.map(makeJSON);
    }

    function makeJSON(x) {
      const str = JSON.stringify(x || _read);
      return reQuo(str);
    }

    function save() {
      C.log(Name, 'saving', _name); // toCode()
      History.push(_read);
    }

    var api = {
      History,
      load,
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
    });

    return api;
  }

  return {
    make: Construct,
  };
});

/*

*/
