require.config({
  baseUrl: 'scripts',
  paths: {
    jquery: '../vendors/jquery.min', //'https://goo.gl/1NXWa8?',
    lodash: '../vendors/lodash.min', //'https://goo.gl/uxQpja?',
    reqyr: '../vendors/require.min', //'https://goo.gl/8jmmsx?',
    lib: 'libs',
    util: 'libs/util',
    ufnp: 'libs/utils-fn',
    usup: 'libs/utils-support',
  },
  shim: {
    _app: {
      // deps: ['init_alphabet', 'init_gestures'],
    },
  },
});

require(['jquery', 'usup', 'lib/pdollar', '_app', 'lib/locstow', 'mover',
], function ($, U, PDollar, App, LS) {
  var W = window;
  var C = console;

  W.drt = {
    App: App,
    PDollar: PDollar,
    LS: LS,
    U: U,
  };

  $(function () {
    App.init($('section.canvas canvas')[0]);
  });

  // expose for testing
  U.expando(W, W.drt, App);
  C.log('_main', W.drt);
});

/*

TODO: PDollar
  fix where strokes having 0 distance (10 duplicate points) throws error

  stop drawing little versions
  clear after subscription
  make grabbing and moving objects happen


mion wants a draw area
  make configurable
  placement
  size

make adding triggers easy


------
mion ideas

  SQUARE is placeholder of bounding box for drawn (unsplash.com or placehold.it)
  M is a menu
  Z is a bulleted list (based on how large it is drawn)
  HORZLINE is a heading the length of the line (of lorem ipsum characters)
  VERTLINE is a paragraph

  square with lines makes table
  undo?

 */
