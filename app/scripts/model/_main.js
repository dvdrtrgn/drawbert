import Element from './element.js';
import Style from './style.js';

export default (function () {
  var API = {
    // Box with associated styles
    Element: Element,
    // anything controlled by CSS
    Style: Style,
    // bindings for relative positions
    Grouping: {
      ids: [], // Array of object ids [#2, #3,...]
    },
    make: function (type) {
      var I = {
        I: this,
        ids: [],
      };
      var E = I.E = new Element(type);
      var S = I.S = new Style(E.style);

      E.addStyle(S);

      I.add = function () {
        var mod = API.make.apply(arguments);
        I.ids.push(mod);
        E.ele.append(mod.E.ele);
        return mod;
      };

      return I;
    },
  };

  return API;
}());
/*

  Sketching (Brainstorming from scratch, out of the head)
    Low fi Concepting
      Wireframe
    Actions
      Deletable
      Movable
      Resizable
      Groupable (basic container)
  Designing
    Reorganization
    Styling
  Developing
    Implementing

 */
