define(["backbone"], function(Backbone) {
  var ToolView = Backbone.View.extend({

    controller: undefined,

    el: "#tool",

    template: _.template("<h2>Hello World!</h2>"),
    
    render: function() {
      console.log(this.options.controller.name);
      this.$el.html( this.template );
      return this;
    },

    close: function() {
      // unbind listeners and tell controller that we don't need the model anymore
      this.options.controller.halt();
    }
  });
  return ToolView;
});