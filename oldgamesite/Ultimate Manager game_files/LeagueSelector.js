GZ.Views.LeagueSelector = Backbone.Marionette.CompositeView.extend({

    template: '#template-league-selector',

    itemView: GZ.Views.LeagueSelectorItem,
    itemViewContainer: '.leagues',

    className: 'fullpage league-selector'

});