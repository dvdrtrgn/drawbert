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

  fix first plot color
  turn compass to nearest point

*/
