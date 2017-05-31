/*globals */

define(['jquery', 'util'], function ($, U) {
  const C = window.console;

  //
  // DOM OPS
  //
  function updateCount(str) {
    $('.js-gesture-count').text(str);
  }

  function hideOverlay() {
    $('.overlay').addClass('hidden');
  }

  function showOverlay(data) {
    var $confidence = $('.js-confidence');

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

  return {
    updateCount,
    hideOverlay,
    showOverlay,
  };
});

/*

*/
