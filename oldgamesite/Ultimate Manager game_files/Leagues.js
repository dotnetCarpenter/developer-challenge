GZ.Collections.Leagues = GZ.CurrentCollection.extend({
    model: GZ.Models.League,

    url: GZ.Backend + "/leagues",

    fetchDeep: function () {
        return this.fetch()
            .pipe(_.bind(function () {
                var promises = this.map(function (league) {
                    return league.fetchDeep();
                });
                return $.when.apply(null, promises);
            }, this));
    },

    findMatch: function (id) {
        var match;
        this.find(function (league) {
            return league.get("rounds").find(function (round) {
                var m = round.getMatch(id);
                if (!_.isUndefined(m)) {
                    match = m;
                    return true;
                }
            });
        });
        return match;
    }

});