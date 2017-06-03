const [C, U, W] = [console, undefined, window];

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
      deps: ['init_alphabet', 'init_gestures'],
    },
  },
});

require(['jquery', 'util', '_app', 'data'], function ($, U, App, Data) {
  W.drt = {
    App,
    data: Data.make(),
    testdraw: function (x) {
      if (U.undef(x)) {
        App.reads.clouds.map(App.render.drawCloud);
      } else if (typeof x === 'string') {
        App.playStroke(x);
      } else if (typeof x === 'number') {
        App.render.drawCloud(App.reads.clouds[x]);
      }
    },
  };

  $(function () {
    App.init($('canvas:first')[0]);
  });

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
