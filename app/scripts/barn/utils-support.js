///
//lib/utils-support.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: extend util with `supports` paradigm

*/
define(['util'], function (U) {
  let Supports = Object.create(null);
  let hasPassive;

  function detectPassiveEvents() {
    if (
      U.undef(hasPassive) &&
      typeof window === 'object' &&
      typeof window.addEventListener === 'function' &&
      typeof Object.defineProperty === 'function'
    ) {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => hasPassive = true,
      });
      window.addEventListener('test', null, opts);
    } else {
      hasPassive = false;
    }
    return hasPassive;
  }

  let default2passive = function () {
    if (!detectPassiveEvents()) throw 'passive events not supported';

    const theSuper = EventTarget.prototype.addEventListener;
    const defOpts = {
      passive: true,
      capture: false,
    };
    EventTarget.prototype.addEventListener = function (type, listener, opts) {
      const usesOpts = (typeof opts === 'object');
      const useCapture = (usesOpts ? opts.capture : opts);
      opts = usesOpts ? opts : {};
      opts.passive = U.undef(opts.passive) ? defOpts.passive : opts.passive;
      opts.capture = U.undef(useCapture) ? defOpts.capture : useCapture;
      theSuper.call(this, type, listener, opts);
    };
    default2passive = U.noop;
  };

  Supports = Object.defineProperties(Supports, {
    passiveEvents: {
      get: () => detectPassiveEvents(),
    },
  });

  return U.expando(U, {
    Supports,
    default2passive,
  });
});
