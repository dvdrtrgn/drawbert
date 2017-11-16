define(['./element', './style'], function (Element, Style) {
  var Object = {
    // Box with associated styles
    Element: Element,
    // anything controlled by CSS
    Style: Style,
    // bindings for relative positions
    Grouping: {
      ids: [], // Array of object ids [#2, #3,...]
    },

  };

  return Object;

});


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
