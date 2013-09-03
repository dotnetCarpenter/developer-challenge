GZ.Collections.Squads = GZ.Collection.extend({

	model: GZ.Models.Squad,

    url: function() {
        return GZ.Backend + "/leagues/" + this.options.league_id + "/squads";
    },

    initialize: function (models, options) {
        this.options = _.extend({}, this.options, options);
    },

    getHighestValuedPlayer: function() {
        var squadPlayers = this.pluck('players'),
            allPlayers = _.reduce(squadPlayers, function (memo, players) {
                return memo.concat(players.models);
            }, []);
        sortedHighValuePlayers = _.sortBy(allPlayers, function(p){
            return -p.get('value');
        });
        return sortedHighValuePlayers[0];
    },

    getAllPlayers: function () {
        var allPlayers = _.reduce(this.pluck("players"),
            function (memo, players) {
                return memo.concat(players.toJSON());
            },
            []);
        return allPlayers.sort(this._firstNameComparator);
    },

    _firstNameComparator: function (a, b) {
        var an = a.first_name.toLowerCase(), bn = b.first_name.toLowerCase();
        return an < bn ? -1 : an === bn ? 0 : 1;
    }

});