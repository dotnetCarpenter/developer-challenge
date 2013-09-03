GZ.Collections.Rankings = GZ.Collections.SortableTableCollection.extend({

    model: GZ.Models.RankingItem,

    // parse prevents us from having a separate Model just for group/round concerns
    parse: function(data) {
        if (!data.response) {
            return [];
        }

        var rankings = _.sortBy(data.response.rankings, function(item){
            return item.score.earnings;
        }).reverse().map(function(element, index){
            element.rank = index+1;
            element.isCurrentUser = (element.manager_id == GZ.User.get('id'));
            return element;
        });

        return rankings;
    },

    url: function() {
        var path = GZ.Backend + "/ranking/" + this.group;

        if (this.round) {
            path += "/" + this.round;
        }
        if (!!this.cachebust) {
            path += "?cachebust="+(new Date().getTime());
        }

        return path;
    },

    // Sort current user first
    comparator: function(modelA, modelB) {
        if (modelA.get('isCurrentUser')) return -1;
        if (modelB.get('isCurrentUser')) return 1;
        return GZ.Collections.SortableTableCollection.prototype.comparator.apply(this, arguments);
    }

});