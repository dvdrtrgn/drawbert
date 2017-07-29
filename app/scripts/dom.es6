/*globals */
// DOM.ES6
/*

  USE:

*/
define(['jquery', 'util'], function ($, U) {
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
  //
  $.reify = function (obj) { // replace vals(selectors) with elements
    return $.each(obj, function (i, sel) {
      if (typeof sel === 'object') sel = sel.selector;
      (obj[i] = $(sel)).selector = sel;
    });
  };

  $.fn.enable = function () {
    $(this).removeClass('disabled').attr('disabled', false);
  };

  $.fn.disable = function () {
    $(this).addClass('disabled').attr('disabled', true);
  };

  // - - - - - - - - - - - - - - - - - -
  // PUBSUBS
  //
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

  function showOverlay(dat) {
    const $confidence = $('.js-confidence');
    const $options = $('.option-template');
    let data = Object.assign({
      name: 'null',
      score: 0,
    }, dat);

    $('.overlay').removeClass('hidden');
    $('.js-guess').text(data.name);

    if (!dat) $options.disable();
    else $options.enable();

    $confidence.text(U.percent(data.score) + '%');
    $confidence.removeClass('high medium low');
    $(`[data-name=${data.name}]`).focus();

    if (data.score > 0.8) {
      $confidence.addClass('high');
    } else if (data.score > 0.2) {
      $confidence.addClass('medium');
    } else {
      $confidence.addClass('low');
    }
  }

  function makeNameSpacer(namespace) {
    let join = `.${namespace} `;
    // str + space ensures namespace on last item
    return (str) => `${str} `.replace(/ +/g, join);
  }

  function bindNameSpacer(namespacer, meth) {
    let opt = {
      passive: true,
    };
    return (jq, evstr, handler) => {
      if (evstr.match(/^touch/)) {
        jq.each((i, e) => e.addEventListener(evstr, handler, opt));
        return jq;
      } else {
        return jq[meth](namespacer(evstr), handler);
      }
    };
  }

  function _getZ(jq) {
    return Number($(jq).css('z-index')) || 1;
  }

  function raise(jq) {
    let z = _getZ(jq);
    jq.css({
      opacity: 0.9,
      zIndex: z * 10,
    });
  }

  function lower(jq) {
    let z = _getZ(jq);
    jq.css({
      opacity: 1,
      zIndex: z / 10,
    });
  }

  function makeChoiceBtn(name, value) {
    let btn = $('<button class="js-choice">');
    btn.attr('data-name', name);
    btn.attr('title', name.toUpperCase());
    btn.text(value || name);
    return btn;
  }

  function readTemplate() {
    let div = $('.option-template');
    return JSON.parse(div.text());
  }

  function fillOptions(opts) {
    let div = $('.option-template');
    opts = (opts || readTemplate());
    div.empty();
    opts.forEach(arr => {
      if (arr) div.append(makeChoiceBtn(...arr));
    });
  }

  window.DOM = API;

  U.expando(API, {
    hideOverlay,
    bindNameSpacer,
    makeNameSpacer,
    normTouch,
    showOverlay,
    raise,
    lower,
    fillOptions,
  });
  return API;
});
/*



*/
