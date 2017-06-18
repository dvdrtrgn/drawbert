/*globals */
// ARR.ES6
/*

  USE:

*/
define([], function () {
  const C = window.console;
  const Nom = 'Arr';
  const Super = Array;

  function dump() {
    let temp = `"${this.toString()}"[${this.length}]`;
    C.log(Nom + ':dump', temp);
  }

  const propObj = {
    dump: {
      value: dump,
    },
    logs: {
      get: dump,
    },
  };

  function Arr(len) {
    len = Number(len) || 0;
    let inst = new Super(len);
    inst.__proto__ = Arr.prototype;
    return inst;
  }

  Arr.prototype = Object.create(Super.prototype, propObj);

  return Arr;
});
/*



*/
