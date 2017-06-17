/*globals */

define([], function () {
  const C = window.console;
  const dbug = 1;

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
    dbug && C.log(source.constructor);

    const box = {
      source,
      offset: (qty) => segment(box, qty),
      update: measure,
    };

    return box;
  }

  return {
    make: Box,
  };
});

/*

*/
