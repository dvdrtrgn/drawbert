/*eslint indent:off, */
export default function API(config) {
    const Colors = ['white', 'black', 'gray'];

    function setter(key, val) {
      var org = this[key];
      var num = typeof org === 'number';
      var dif = num ? val - org : 0;
      var i, sub;

      if (!num) this[key] = val;
      else this[key] += dif;

      // apply difference to sub items
      for (i in this.links) {
        sub = this.links[i];
        if (!num) sub[key] = val;
        else sub[key] += dif;
      }
    }

    function getter(key) {
      var rev = this.reverse;

      switch (key) {
      case 'borderColor':
        return Colors[this.borderColor];
      case 'foreground':
        return Colors[this[rev ? 'background' : 'foreground']];
      case 'background':
        return Colors[this[rev ? 'foreground' : 'background']];
      default:
        return this[key];
      }
    }

    var defs = {
      links: [],
      // methods
      get: getter,
      set: setter,
      // Colors
      foreground: 1,
      background: 0,
      borderColor: 2,
      reverse: false, // swap fg/bg
      // Shape
      borderWidth: 1,
      corner: 1.0,
      width: 100.0,
      height: 100.0,
      // Font
      para: 12,
      head: 21,
      // Position
      x: 100.0,
      y: 100.0,
      z: 1000,
      dumpCss: function () {
        return {
          backgroundColor: this.get('background'),
          border: this.get('borderWidth') + 'px solid ' + this.get('borderColor'),
          borderRadius: this.get('corner'),
          color: this.get('foreground'),
          fontSize: this.get('para'),
          height: this.get('height'),
          left: this.get('x'),
          opacity: '0.5',
          position: 'absolute',
          textAlign: 'center',
          top: this.get('y'),
          width: this.get('width'),
          zIndex: this.get('z'),
        };
      },
    };

    Object.assign(this, defs, config);
}
