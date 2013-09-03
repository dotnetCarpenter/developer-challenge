GZ.Models.LeagueRound = GZ.RelationalModel.extend({

    urlRoot: GZ.Backend + "/rounds",

    relations: [
        {
            type: Backbone.HasMany,
            key: 'matches',
            relatedModel: GZ.Models.Match,
            collectionType: GZ.Collections.SortedMatches
        }
    ],

    initialize: function (options) {
        this.get("matches").round_id = this.id;
    },

    // Sorts matches into collections grouped by match day
    getMatchDays: function() {
        var allMatches = this.get('matches');
        return _.chain(allMatches.pluck('played_on'))
                .map(function(played_on){
                    return GZ.helpers.date.day(played_on);
                })
                .uniq()
                .map(function(played_on){
                    var matches = allMatches.filter(function(match){
                        return played_on == GZ.helpers.date.day(match.get('played_on'));
                    });
                    return {
                        played_on: played_on,
                        matches: matches
                    };
                })
                .value();
    },

    getMatch: function (match_id) {
        return this.get("matches").get(match_id);
    },

    processMatchEvent: function (data) {

        if (data.scoreProcessed) {
            return;
        }

        var match = this.getMatch(data.match_id),
            home,
            away;
        if (match) {
            match.get("match_events").add(data);
            match.recalculateScore();
            match.recalculatePeriod();
        }
    }
});