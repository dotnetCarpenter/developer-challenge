define([
  'views/base/view',
  'text!templates/tool.hbs'
], function(View, template) {
  'use strict';

  var ToolView = View.extend({
    // Automatically render after initialize
    autoRender: true,

    className: 'tool',

    events: {'change select': 'dataset'},

    // Save the template string in a prototype property.
    // This is overwritten with the compiled template function.
    // In the end you might want to used precompiled templates.
    template: template,

    dataset: function(event) {
      var status = this.$('legend');
      status.text("Feching data...");
      console.dir(this.model.serialize());
      // this.model.once('change', function() {
      //   status.text("Lav nogle filtreringer i datasættet");
      // });
      this.options.target(event.target.value);
    },
    test: function() {
      console.log("test");
    },

    listen: {
      'change model': 'test'
    }

    // initialize: function() {
    //   View.prototype.initialize.apply(this, arguments);
    //   _.bindAll(this);
    // }

  });

  return ToolView;
});
