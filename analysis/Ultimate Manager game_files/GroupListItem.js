GZ.Views.GroupListItem = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',
    template: '#template-group-view-list-item',

    events: {
        'click': 'showManager'
    },

    modelEvents: {
        'change': 'render'
    },

    showManager: function() {
        GZ.app.vent.trigger("app:showTeamGroup", this.model.get('team_id'), this.options.group_id);
    }

});