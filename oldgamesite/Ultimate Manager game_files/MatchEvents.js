GZ.Collections.MatchEvents = GZ.Collection.extend({

    model: GZ.Models.MatchEvent,

    comparator: function(model) {
        return model.get("minutes");
    },

    add: function (models, options) {
        var toAdd = [],
            toRemove = [];

        models = _.isArray(models) ? models.slice() : [models];

        _.each(models, function (model) {
            var skip = false,
                data = (model instanceof Backbone.Model) ? model.attributes : model;

            this.forEach(function(match_event){
                if (_.isUndefined(match_event.get('event_id'))) return false;
                if (match_event.get('event_id') == data.event_id) {
                    // If is_error is true, the event is a correction, cancelling the original match event with the same event_id
                    if (data.is_error === true) {
                        toRemove.push(match_event);
                    }
                    skip = true;
                }
            }, this);


            if (!skip) {
                toAdd.push(model);
            }
        }, this);
        if (toRemove.length) {
            this.remove(toRemove);
        }
        if (toAdd.length) {
            GZ.Collection.prototype.add.call(this, toAdd, options);
        }
        return this;
    }

});