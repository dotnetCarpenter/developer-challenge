GZ.Views.GroupsListItem = Backbone.Marionette.ItemView.extend({

    template: "#template-groups-list-item",
    tagName: "tr",

    events: {
        'click': 'openGroup'
    },

    initialize: function() {
        this.$el.attr({
                    'data-group-id': this.model.get("id"),
                    'data-name': this.model.get('name')
                });
    },

    openGroup: function() {
        GZ.app.vent.trigger('group:open', this.model.id);
    },

    joinGroup: function() {
        var url = GZ.Backend + '/group/' + this.model.get('id') + '/join';
        $.post(url, _.bind(function(response) {
            GZ.app.vent.trigger('group:joined', this.model.get('id'));
        }, this), 'json');
    }

});