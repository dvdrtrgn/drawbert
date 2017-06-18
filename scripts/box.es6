/*globals */
// BOX.ES6
/*

  USE:

*/
define(['lib/util'], function (U) {
  const Name = 'Box';
  const W = window;
  const C = W.console;
  const API = {
    name: Name,
    dbug: 1,
    imports: {
      U,
    },
  };

  function segment(xyObj, slices) {
    let currX, currY, gapX, gapY;

    const reset = function () {
      currX = slices - 1, currY = slices - 1;
      gapX = xyObj.w / slices;
      gapY = xyObj.h / slices;
    };

    const advance = function () {
      currX -= 1;
      if (currX === -1) currX = slices - 1, currY -= 1;
    };

    return {
      advance,
      reset,
      get slices() {
        return slices;
      },
      set slices(int) {
        slices = int;
      },
      get x() {
        return currX * gapX;
      },
      get y() {
        return currY * gapY;
      },
    };
  }

  const measure = function () {
    let cc = this.source;
    this.w = cc.offsetWidth;
    this.h = cc.offsetHeight;
    this.x = cc.offsetLeft;
    this.y = cc.offsetTop;
    while (cc.offsetParent !== null) {
      cc = cc.offsetParent;
      this.x += cc.offsetLeft;
      this.y += cc.offsetTop;
    }
    return this;
  };

  function Box(source) {
    API.dbug && C.log(source.constructor);

    const box = {
      source,
      offset: (qty) => segment(box, qty),
      update: measure,
    };
    return box;
  }

  function Calc(minmax) {
    API.dbug && C.log(minmax);
    const box = {
      x: minmax.xmin,
      y: minmax.ymin,
      w: minmax.xmax - minmax.xmin,
      h: minmax.ymax - minmax.ymin,
    };
    return box;
  }

  U.expando(API, {
    make: Box,
    new: Box,
    calc: Calc,
  });
  return API;
});
/*



*/
