GZ.Views.ManagerProfileTeamsItem = Backbone.Marionette.ItemView.extend({

    template: '#template-manager-profile-teams-item', // Template: manager-profile-teams-item.html
    tagName: "tr",

    events: {
        'click .action-view-team': 'viewTeam'
    },

    templateHelpers: function () {
        var l = this.model.getLeague();
        return {
            'groups': this.model.getGroups().toJSON(),
            'league_name': l.get("common_name")
        };
    },

    viewTeam: function (evt) {
        GZ.app.vent.trigger('app:showTeam', this.model);
    }

});
