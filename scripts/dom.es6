/*globals */

define(['jquery', 'lib/util'], function ($, U) {
  const C = window.console;

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
    if (evt.originalEvent.changedTouches) {
      evt = evt.originalEvent.changedTouches[0];
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

  return {
    getScrollY,
    hideOverlay,
    normTouch,
    showOverlay,
    updateCount,
  };
});

/*

*/
