/*globals */
// TRIGGER.ES6
/*

  USE:

*/
define(['jquery', 'lib/util',
], function ($, U) {
  const NOM = 'Trigger';
  const W = window;
  const C = W.console;
  const API = {
    name: NOM,
    dbug: 0,
    imports: {
      $, U,
    },
  };

  function extend(api) {

    Object.defineProperties(api, { // .__proto__
      to: {
        get: () => api[api.length - 1],
      },
    });
  }

  function Trigger() {
    const api = [];
    extend(api);
    if (API.dbug) C.log(NOM, 'invoke util', api);
    return api;
  }

  U.expando(API, {
    new: Trigger,
  });
  return API;
});
/*



*/
