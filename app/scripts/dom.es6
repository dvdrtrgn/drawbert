/*globals */
// DOM.ES6
/*

  USE:

*/
define(['jquery', 'lib/util'], function ($, U) {
  const NOM = 'Dom';
  const W = window;
  const C = console;
  const API = {
    name: NOM,
    dbug: 1,
    imports: {
      $, U,
    },
  };

  // - - - - - - - - - - - - - - - - - -
  // AUTOMATE
  $.reify = function (obj) { // replace vals(selectors) with elements
    return $.each(obj, function (i, sel) {
      if (typeof sel === 'object') sel = sel.selector;
      (obj[i] = $(sel)).selector = sel;
    });
  };

  // - - - - - - - - - - - - - - - - - -
  // PUBSUBS
  let Q = $.pubsubs = $({});
  $.publish = function () {
    Q.trigger.apply(Q, arguments);
  };
  $.subscribe = function () {
    Q.on.apply(Q, arguments);
  };
  $.unsubscribe = function () {
    Q.off.apply(Q, arguments);
  };

  // - - - - - - - - - - - - - - - - - -
  // DOM OPS
  //
  function hideOverlay() {
    $('.overlay').addClass('hidden');
  }

  function normTouch(evt) {
    evt.preventDefault(evt);

    let touch = evt.originalEvent.changedTouches;
    let button = evt.originalEvent.ctrlKey ? 2 : 0;

    if (touch) {
      evt = touch[0];
      evt.button = button;
    }
    return evt;
  }

  function showOverlay(data) {
    const $confidence = $('.js-confidence');

    $('.overlay').removeClass('hidden');
    $('.js-guess').text(data.name);

    $confidence.text(U.percent(data.score) + '%');
    $confidence.removeClass('high medium low');

    if (data.score > 0.8) {
      $confidence.addClass('high');
    } else if (data.score > 0.2) {
      $confidence.addClass('medium');
    } else {
      $confidence.addClass('low');
    }
  }

  U.expando(API, {
    hideOverlay,
    normTouch,
    showOverlay,
  });
  return API;
});
/*



*/
