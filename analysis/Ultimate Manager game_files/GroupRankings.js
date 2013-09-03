GZ.Collections.GroupRankings = GZ.Collection.extend({

    model: GZ.Models.RankingItem,

    initialize: function () {
        this.listenTo(this, 'sort', this.attributeRank, this);
    },

    comparator: function (ranking) {
        // Sort by earnings descending
        return -ranking.get('earnings');
    },

    attributeRank: function () {
        this.each(function (ranking, idx) {
            ranking.set('rank', idx+1);
        }, this);
    }

});