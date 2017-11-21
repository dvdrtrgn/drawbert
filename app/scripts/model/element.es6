define(['jquery'], function ($) {
  const WIN = window;
  const CON = WIN.console;
  const NOM = 'Element';

  function manifest(data) {
    var ele = data.ele = $(data.ele);

    ele.api = data;
    ele.data(NOM, data).appendTo('.editzone');
  }

  const Types = {
    default: { // X / empty
      ele: '<div><br>empty</div>',
      style: {
        corner: 0,
      },
    },
    Picture: {
      ele: '<img>',
      style: {
        corner: 20,
        reverse: true,
      },
    },
    Table: {
      ele: `<table>
        <tr> <td>a</td> <td>b</td> </tr>
        <tr> <td>c</td> <td>d</td> </tr>
      </table>`,
    },
    Para: {}, // text
    Head: {}, // text
    List: {},
    Form: {},
    Button: {}, // link or action
    Menu: {},
  };

  const Meths = {
    appendTo: function (ele) {
      // recalc x and y?
      // add to links
      CON.log(NOM, this, ele);
    },
    addStyle: function (style) {
      this.style = style;
      this.applyStyle();
    },
    applyStyle: function () {
      this.ele.css(this.style.dumpCss());
    },
  };

  function Element(type) {
    type = (type in Types) ? type : 'default';

    var api = this;
    Object.assign(api, Types[type], Meths);
    manifest(api);

    return api;
  }

  return Element;
});
