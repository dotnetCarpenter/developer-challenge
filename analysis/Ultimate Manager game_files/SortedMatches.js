GZ.Collections.SortedMatches = GZ.Collection.extend({

    model: GZ.Models.Match,

    url: function () {
        return GZ.Backend + "/rounds/"+this.round_id+"/matches";
    },

    /*
    * Sort sets by match status: ongoing before ended before not-started
    * Disabled: Sort subsets by minute: ongoing@m91 before ongoing@m25
    */
    comparator: function(match) {
        return match.get("played_on");
    },

    fetch: function (options) {
        options = _.extend({ merge: true }, options);
        return GZ.Collection.prototype.fetch.call(this, options);
    }

});