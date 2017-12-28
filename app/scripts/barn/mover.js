///
//mover.js
/*

  CHANGED: 2017-08-01
  IDEA: allow dragging of elements
  TODO: everything

*/
define(['jquery', 'util'], function ($, U) {
  const NOM = 'Move';
  const W = window;
  const C = console;
  const API = {
    '': {
      NOM, closure: function () {},
    },
    dbug: 1,
    imports: {
      $, U,
    },
  };

  // - - - - - - - - - - - - - - - - - -
  // GLOBS

  const body = $('body');
  const screen = $(window);

  function makeDiv() {
    let div = $('<div>').css({
      background: 'red',
      color: 'blue',
      height: 99,
      left: 9,
      position: 'absolute',
      top: 9,
      width: 99,
      zIndex: 999,
    });

    return div.appendTo(body);
  }

  // - - - - - - - - - - - - - - - - - -
  // CONSTRUCT

  function makeMovable(ele) {
    ele = $(ele);
    let isDown, offset;

    ele.on({
      mousedown: function (evt) {
        evt.preventDefault();
        isDown = true;
        offset = ele.offset();
        offset.left -= evt.clientX;
        offset.top -= evt.clientY;
      },
    });
    body.on({
      mousemove: function (evt) {
        if (isDown) ele.offset({
          left: (evt.clientX + offset.left),
          top: (evt.clientY + offset.top),
        });
      },
    });
    screen.on({
      mouseup: () => isDown = false,
    });
  }

  // - - - - - - - - - - - - - - - - - -
  // TEST

  API.dbug && makeMovable('.js-train');

  // - - - - - - - - - - - - - - - - - -
  // EXPORT

  U.apiExpose(API, arguments, {
    new: makeMovable,
    makeDummyDiv: () => makeMovable(makeDiv()),
  });
  return window.MOVE = API;
});
/*



*/
