GZ.Views.Transfer = Backbone.Marionette.ItemView.extend({
    template: "#basket_player",
    
    tagName: "tr",

    initialize: function() {
        this.$el.attr("data-playerid", this.model.get("id"));
    }
});