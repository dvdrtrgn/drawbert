//_main.js
/*eslint indent:off, */
/*

  CHANGED: 2017-12-28

*/
import {W, C, U, $} from './_globs.js';
import App from './app.js';
import Model from './model/_main.js';

  W.drt = {};

  $(function () {
    App.init($('section.canvas canvas')[0]);
  });

  // expose for testing
  W.mod = Model;
  U.expando(W.drt, App);
  C.log('drt_main', W.drt);

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
