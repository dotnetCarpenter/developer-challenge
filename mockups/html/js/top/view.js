define(["backbone"], function(Backbone) {
  var ToolView = Backbone.View.extend({

    controller: undefined,

    el: "#top",

    template: _.template("<h2>Top</h2><a href='#tool''>tool</a><br/><a href='#''>index</a>"),
    
    render: function() {
      console.log(this.options.controller.name);
      this.$el.html( this.template );      
      this.$el.removeClass("hidden").addClass("show");
      return this;
    },

    bindedRemove: undefined,

    close: function() {
      // hide element, unbind listeners and remove element
      this.bindedRemove = _.bind(this.remove, this);
      this.$el.bind("transitionend", this.bindedRemove);
      //this.listenTo(this.$el, "transitionend", this.remove);  // doesn't work
      this.$el.removeClass("show").addClass("hidden");
      // this.remove();
      // this.unbind();
      return this;
    },
    remove: function() {
      this.$el.unbind("transitionend", this.bindedRemove);
      this.undelegateEvents();
      this.$el.empty();
      this.stopListening();
      this.trigger("removed");
      return this;
    }
  });
  return ToolView;
});