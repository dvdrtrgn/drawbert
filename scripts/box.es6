/*globals */

define([], function () {
  const C = window.console;

  function offset(box, seg) {
    let currX, currY, gapX, gapY;
    const reset = function () {
      currX = seg - 1, currY = seg - 1;
      gapX = box.w / seg;
      gapY = box.h / seg;
    };
    const advance = function () {
      currX -= 1;
      if (currX === -1) currX = seg - 1, currY -= 1;
    };

    return {
      factor: seg,
      advance,
      reset,
      get x() {
        return currX * gapX;
      },
      get y() {
        return currY * gapY;
      },
    };
  }

  function fromCanvas(canvas) {
    const update = function () {
      let cc = this.canvas;
      this.w = cc.width;
      this.h = cc.height;
      this.x = cc.offsetLeft;
      this.y = cc.offsetTop;
      while (cc.offsetParent !== null) {
        cc = cc.offsetParent;
        this.x += cc.offsetLeft;
        this.y += cc.offsetTop;
      }
      return this;
    };
    return {
      canvas,
      update,
    };
  }

  return {
    C,
    make: {
      fromCanvas,
      offset,
    },
  };
});

/*

*/
