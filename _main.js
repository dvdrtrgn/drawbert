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

require(['_app'], function (App) {
  W.drt = {
    App,
  };

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


 */
