require.config({
  baseUrl: 'scripts',
  paths: {
    jquery: '/vendors/jquery.min', //'https://goo.gl/1NXWa8?',
    lodash: '/vendors/lodash.min', //'https://goo.gl/uxQpja?',
    reqyr: '/vendors/require.min', //'https://goo.gl/8jmmsx?',
    lib: '/libs',
  },
  shim: {
    _app: {
      // deps: ['init_alphabet', 'init_gestures'],
    },
  },
});

require(['jquery', 'util', '_app', 'data', 'pdollar',
], function ($, U, App, Data, PDollar) {
  const [C, W] = [console, window];

  W.drt = {
    App,
    PDollar,
    data: Data.make(),
  };

  $(function () {
    App.init($('canvas:first')[0]);
  });

  // expose for testing
  U.expando(W, W.drt, App);
  C.log('_main', W.drt);
});

/*

TODO PDollar
  fix where strokes having 0 distance (10 duplicate points) throws error



mion wants a draw area
  make configurable
  placement
  size

make adding triggers easy


save learned patterns
  how to export?
  how to save?
  how to view?


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
