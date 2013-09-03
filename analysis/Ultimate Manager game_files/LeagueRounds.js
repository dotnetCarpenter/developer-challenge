GZ.Collections.LeagueRounds = GZ.Collection.extend({
    model: GZ.Models.LeagueRound,

    comparator: function(round) {
        return round.get("matchday");
    },

    getRoundForMatchday: function (matchday) {
        return this.find(function (round) {
            return round.get("matchday") == matchday;
        });
    }

});