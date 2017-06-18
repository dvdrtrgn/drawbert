/*globals */
// DOM.ES6
/*

  USE:

*/
define(['jquery', 'lib/util'], function ($, U) {
  const Name = 'Dom';
  const W = window;
  const C = W.console;
  const API = {
    name: Name,
    dbug: 1,
    imports: {
      $, U,
    },
  };

  //
  // DOM OPS
  //
  function getScrollY() {
    let scrollY = 0;

    if (!U.undef(document.body.parentElement)) {
      scrollY = document.body.parentElement.scrollTop; // IE
    } else if (!U.undef(window.pageYOffset)) {
      scrollY = window.pageYOffset; // FF
    }
    return scrollY;
  }

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

  function updateCount(str) {
    $('.js-gesture-count').text(str);
  }

  U.expando(API, {
    getScrollY,
    hideOverlay,
    normTouch,
    showOverlay,
    updateCount,
  });
  return API;
});
/*



*/
