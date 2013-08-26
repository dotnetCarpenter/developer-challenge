GZ.Collections.PlayerBioRoundStats = GZ.Collection.extend({

    collectionOptions: ['playerId'],

    url: function() {
        return GZ.Backend + '/players/' + this.playerId + '/stats/round';
    },

    initialize: function(models, options) {
        if (!options.playerId) {
            throw new Error('playerId must be specified');
        }
        _.extend(this, _.pick(options, this.collectionOptions));
    },

    comparator: function(model) {
        return -model.get('matchday');
    },

    getMaxValue: function() {
        return Math.max.apply(Math, this.pluck('total_earnings'));
    }

});

GZ.Collections.PlayerBioBreakdownStats = GZ.Collection.extend({

    collectionOptions: ['playerId'],

    url: function() {
        return GZ.Backend + '/players/' + this.playerId + '/stats/breakdown';
    },

    initialize: function(models, options) {
        if (!options.playerId) {
            throw new Error('playerId must be specified');
        }
        _.extend(this, _.pick(options, this.collectionOptions));
    },

    parse: function(data) {
        var modData = _.map(data.response.round_earnings, function(obj, key){
            if (!_.isObject(obj)) return null;
            if (obj.occurences === 0) return null;
            return {
                action: key,
                points: obj.points,
                occurences: obj.occurences
            };
        });
        modData = _.reject(modData, function(item){ return _.isNull(item); });
        return modData;
    },

    comparator: function(model) {
        return -model.get('points');
    },

    getMaxValue: function() {
        return Math.max.apply(Math, this.pluck('points'));
    }

});