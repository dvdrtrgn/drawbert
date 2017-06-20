/*globals */
// DOM.ES6
/*

  USE:

*/
define(['jquery', 'lib/util'], function ($, U) {
  const NOM = 'Dom';
  const W = window;
  const C = console;
  const D = document;
  const API = {
    name: NOM,
    dbug: 1,
    imports: {
      $, U,
    },
  };

  //
  // DEBUG OPS
  //
  let testy;

  W.setInterval(function () {
    let y = JSON.stringify(getScrollYs());
    if (y !== testy) {
      testy = y;
      C.log(testy);
    }
  }, 99);

  //
  // DOM OPS
  //
  function getScrollYs() {
    return {
      norm: D.body.scrollTop,
      msie: D.body.parentElement.scrollTop,
      ff: W.pageYOffset,
    };
  }

  function getScrollY() {
    return W.pageYOffset;
    // let y = getScrollYs();
    // return 0 || y.norm || y.msie || y.ff || 0;
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
