define(["backbone"], function(Backbone) {
  var ToolView = Backbone.View.extend({

    controller: undefined,

    el: "#tool",

    template: _.template("<h2>Hello World!</h2><a href='#tool''>tool</a><br/><a href='#''>index</a><br/><a href='#top/10''>top 10</a>"),

    // events: {
    //   "transitionend #tool": "remove",
    //   "webkitTransitionEnd #tool": "remove"
    // },

    bindedRemove: undefined,

    render: function() {
      console.log(this.options.controller.name);
      this.$el.html( this.template );
      this.$el.removeClass("hidden").addClass("show");
      return this;
    },

    close: function() {
      // hide element, unbind listeners and remove element
      this.bindedRemove = _.bind(this.remove, this);
      this.$el.bind("transitionend", this.bindedRemove);
      //this.listenTo(this.$el, "transitionend", this.remove);  // doesn't work
      this.$el.removeClass("show").addClass("hidden");
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