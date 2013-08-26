GZ.Collections.TeamPlayers = GZ.Collection.extend({

    model: GZ.Models.TeamPlayer,
    url: GZ.Backend + "/player",

    sortingOrder: ["Goalkeeper", "Defender", "Midfielder", "Forward"],

    comparator: function (model) {
        return _.indexOf(this.sortingOrder, model.get("position"));
    },

    get: function (obj) {
        var value = GZ.Collection.prototype.get.apply(this, arguments);

        // If we cannot find the cid/id in the current collection, go
        // through all the sub-models and try to find the item.
        if (_.isUndefined(value)) {
            value = this.find(function (model) {
                var p = model.get("player"),
                    goodValues = {};
                if (_.isUndefined(p) || _.isNull(p)) return false;
                goodValues[p.cid] = true;
                goodValues[p.id] = true;
                return goodValues[obj.id || obj.cid || obj];
            });
        }

        return value || undefined; // Remove null values.
    },

    findByPosition: function (position) {
        return this.filter(function (model) {
            return model.get("position") == position;
        }, this);
    }
    
});
