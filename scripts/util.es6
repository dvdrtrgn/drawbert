/*globals */
define(function () {
  const rand = (lo, hi) => Math.floor((hi - lo + 1) * Math.random()) + lo;
  const round = (n, d) => Math.round(n * (d = Math.pow(10, d))) / d;
  const undef = (x) => typeof x === 'undefined';
  const percent = (num) => (round(num, 2) * 100) | 0;
  const collisions = (o, a) => a.filter(k => k in o && typeof o[k] === 'function');

  function allkeys(obj) {
    var i, arr = [];
    for (i in obj) arr.push(i);
    return arr;
  }

  function checkCollision(o1, o2) {
    var all = collisions(o1, allkeys(o2));
    if (all.length) throw Error(`collisions: ${all}`);
  }

  function getScrollY() {
    var scrollY = 0;

    if (!undef(document.body.parentElement)) {
      scrollY = document.body.parentElement.scrollTop; // IE
    } else if (!undef(window.pageYOffset)) {
      scrollY = window.pageYOffset; // FF
    }
    return scrollY;
  }

  return {
    checkCollision,
    getScrollY,
    percent,
    rand,
    round,
    undef,
  };
});
