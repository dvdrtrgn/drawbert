/*globals */

define(['reader'], function () {
  const History = [];
  const C = window.console;
  const Name = 'Data';
  const reQuo = (str) => str.replace(/"|\[|\]/g, `'`);

  function Construct() {
    let _name;
    let _data;
    let _read;

    function load(name, data) {
      _name = name;
      _data = data;
      _read = [name];

      data.forEach(function (e) {
        const [x, y, i] = [...e];
        _read[i] = _read[i] || [];
        _read[i].push(x, y);
      });
      return this;
    }

    function toCode() {
      return `.readGesture [ ${toString()} ]`;
    }

    function toString() {
      return reQuo(toStrings().join(', '));
    }

    function toStrings() {
      return _read.map(makeJSON);
    }

    function makeJSON(x) {
      const str = JSON.stringify(x || _read);
      return reQuo(str);
    }

    function save() {
      History.push(_read);
    }

    function log() {
      C.log(Name, 'saving', toCode());
    }

    var api = {
      History,
      load,
      log,
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
      data: {
        get: () => _data,
      },
      read: {
        get: () => _read,
      },
      code: {
        get: toCode,
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
