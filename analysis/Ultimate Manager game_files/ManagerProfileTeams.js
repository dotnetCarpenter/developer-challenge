GZ.Views.ManagerProfileTeams = Backbone.Marionette.CompositeView.extend({

    tagName: 'table',
    template: '#template-manager-profile-teams', // Template: manager-profile-teams.html
    itemViewContainer: "tbody",
    itemView: GZ.Views.ManagerProfileTeamsItem,
    className: 'gradient-header'

});
