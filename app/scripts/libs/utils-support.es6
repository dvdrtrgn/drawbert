/*globals */
define(['util'], function (U) {
  let Supports = Object.create(null);

  let passive = false;

  function detectPassiveEvents() {
    if (
      typeof window === 'object' &&
      typeof window.addEventListener === 'function' &&
      typeof Object.defineProperty === 'function'
    ) {
      const options = Object.defineProperty({}, 'passive', {
        get() {
          passive = true;
        },
      });
      window.addEventListener('test', null, options);
      // Supports.passiveEvents = passive;
    }
    return passive;
  }

  Supports = Object.defineProperties(Supports, {
    passiveEvents: {
      get: () => passive || detectPassiveEvents(),
    },
  });

  return U.expando(U, {
    Supports,
  });
});
