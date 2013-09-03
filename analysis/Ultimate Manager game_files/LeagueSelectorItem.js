GZ.Views.LeagueSelectorItem = Backbone.Marionette.ItemView.extend({

    template: '#template-league-selector-item',

    className: 'league',

    events: {
        'click': 'selectLeague'
    },

    templateHelpers: function () {
        var types = {
            '8': "premierleague",
            '22': "bundesliga"
            //'?': "championsleague"
        };

        return {
            'league_type': types[this.model.getStrippedCompetitionId()],
            'season_name': this.model.getSeasonName()
        };
    },

    selectLeague: function (evt) {
        evt.preventDefault();
        GZ.router.navigate("team/new/"+this.model.id, { trigger: true });
    }

});