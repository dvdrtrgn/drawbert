/*globals */
define(['jquery'], function () {
  const double = (x) => x + x;
  const hasval = (x) => x != null;
  const summer = (...az) => az.reduce((a, b) => a + b);
  const decorate = (decored, fn) => (...az) => decored(fn, ...az);

  function curry(fn, cnt = 2) {
    return function curried(...az) {
      let [args, done] = [az.slice(0, cnt), az.length >= cnt];
      return done ? fn(...args) : (...az) => curried(...args, ...az);
    };
  }

  function provided(guard) {
    let guarded = function (fn, ...az) {
      return guard(...az) ? fn(...az) : 0;
    };
    return curry(decorate)(guarded);
  }

  let maybe = provided(hasval);

  return {
    double, hasval, curry, decorate, provided, maybe, summer,
    sum3: curry(summer, 3),
    maydub: maybe(double),
  };
});
