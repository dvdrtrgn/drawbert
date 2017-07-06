/*globals */
// TRIGGER.ES6
/*

  USE:

*/
define(['jquery', 'util',
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
  const DF = {
    fposite: 'https://dummyimage.com/XxY',
    starsite: 'http://stevensegallery.com/g/X/Y',
    viasite: 'http//via.placeholder.com/XxY',
  };

  function _makeEle(evt, result) {
    let zone = $('.editzone').first();
    let box = result.gesture.bounds;
    let div = $('<div>') //
      .addClass(evt.type) //
      .appendTo(zone) //
      .css({
        height: box.h,
        left: box.x,
        position: 'absolute',
        top: box.y,
        width: box.w,
      });

    if (API.dbug) C.log(NOM, 'makeDiv', evt, result, div);
    return div;
  }

  function _setBkgr(ele, site) {
    let url = site.replace('X', ele.width()).replace('Y', ele.height());
    ele.css('background', `url('${url}')`);
  }

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

  function makeSquare(evt, result) {
    let div = _makeEle(evt, result);
    _setBkgr(div, DF.fposite);
  }

  function makeStar(evt, result) {
    let div = _makeEle(evt, result);
    _setBkgr(div, DF.starsite);
  }

  U.expando(API, {
    new: Trigger,
    makeSquare,
    makeStar,
  });
  return API;
});
/*



*/
