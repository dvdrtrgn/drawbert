///
//trigger.es6
/*globals

  CHANGED: 2017-08-01
  IDEA: subscribe to gesture triggers

*/
define(['jquery', 'util',
], function ($, U) {
  const NOM = 'Trigger';
  const W = window;
  const C = W.console;
  const API = {
    '': {
      NOM, closure: function () {},
    },
    dbug: 0,
  };
  const DF = {
    fposite: 'https://dummyimage.com/XxY',
    starsite: 'http://stevensegallery.com/g/X/Y',
    viasite: 'http//via.placeholder.com/XxY',
  };
  let lorem =
    `<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco
    eu fugiat laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit nulla pariatur.</p>`;

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
    $.publish('clear.gesture');
  }

  function extend(api) {

    Object.defineProperties(api, { // HACK: .__proto__
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
    $.publish('print.canvas', 'You drew a square');
  }

  function makeStar(evt, result) {
    let div = _makeEle(evt, result);
    _setBkgr(div, DF.starsite);
    $.publish('print.canvas', 'You drew a star');
  }

  function blatherOn(ele) {
    while (!ele.overflowing()) ele.append(lorem);
  }

  function makeParagraph(evt, result) {
    let div = _makeEle(evt, result).css({
      overflow: 'hidden',
    });

    blatherOn(div);
    $.publish('print.canvas', 'You drew a paragraph');
  }

  U.apiExpose(API, arguments, {
    new: Trigger,
    makeParagraph,
    makeSquare,
    makeStar,
  });
  return API;
});
/*



*/
