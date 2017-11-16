define([], function () {

  const Types = {
    default: {}, // X / empty
    Picture: {},
    Table: {},
    Para: {}, // text
    Head: {}, // text
    List: {},
    Form: {},
    Button: {}, // link or action
    Menu: {},
  };

  function Element(type) {
    type = type || 'default';

    return Types[type];
  }

  return Element;
});
