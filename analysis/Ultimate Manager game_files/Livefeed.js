GZ.Collections.LiveFeed = GZ.Collection.extend(
    _.extend({}, GZ.Mixins.SocketBindings, {

        model: GZ.Models.LiveFeed,

        url: function () {
            return GZ.Backend + '/teams/' + this.team_id + '/history';
        },

        initialize: function() {
            this.initSocket();
        },

        subscribe: function () {
            this.bindToEndpoint('/update', this.addMatchAction, this);
            this.subscribeId('/update', this.team_id);
            this.listenTo(GZ.app.vent, 'league:'+this.league_id+':round:match_event:processed', this.add, this);
        },

        unsubscribe: function () {
            this.unbindToEndpoint('/update');
            this.unsubscribeId('/update', this.team_id);
            this.stopListening(GZ.app.vent, 'league:'+this.league_id+':round:match_event:processed', this.add, this);
        },

        addMatchAction: function(data) {
            if (!data.data_type) return;
            this.add(data);
        },

        comparator: function(a, b) {
            if (a.get("timestamp") === b.get("timestamp")) {
                if (a.cid === b.cid) return 0;
                return a.cid < b.cid ? 1 : -1;
            }
            return a.get("timestamp") < b.get("timestamp") ? 1 : -1;
        },

        add: function(models, options) {
            var toAdd = [];
            if (!_.isArray(models)) models = [models];

            _.each(models, _.bind(function(model){
                var occurences;
                if (model instanceof GZ.Models.LiveFeed) {
                    model = model.toJSON();
                }
                if (this._checkModel(model)) {
                    occurences = Math.abs(model.occurences || 1);
                    model.total_points = model.total_points / occurences;
                    _.times(occurences, function (n) {
                        var clonedModel = _.clone(model);
                        clonedModel.id = ""+clonedModel.id+n;
                        toAdd.push(clonedModel);
                    });
                }
            }, this));
            GZ.Collection.prototype.add.call(this, toAdd, options);
            return this;
        },

        get: function (obj) {
            var model = GZ.Collection.prototype.get.call(this, obj),
                uuid;
            if (_.isUndefined(model)) {
                uuid = GZ.Models.LiveFeed.generateUUID(obj);
                model = this._byId[uuid];
            }
            return model;
        },

        cancelledEventIds: [],

        _checkModel: function(model) {
            var cancelledEvent, checks;
            if (model.data_type == 'event') {
                if (model.is_error) {
                    cancelledEvent = this.find(function(child){
                        return child.get("event_id") == model.event_id;
                    });
                    // If the cancelled event is not yet loaded, we'll cache the ID
                    if (_.isUndefined(cancelledEvent)) {
                        this.cancelledEventIds.push(model.event_id);
                    } else {
                        this.remove(cancelledEvent);
                    }
                    return false;
                }
                checks = [
                    _.indexOf(this.cancelledEventIds, model.event_id) > -1,
                    _.indexOf(['booking','substitution'], model.event_type) > -1,
                    model.event_type == 'period' && model.period == 'PreMatch'
                ];
                if (_.some(checks, _.identity)) {
                    return false;
                }
            } else if (model.is_error && Math.abs(model.total_points) <= 3000) {
                return false;
            }
            return true;
        },

        loadMore: function () {
            var url = this.url();
            if (this.length > 0) {
                url += '?since='+encodeURIComponent(this.last().get("timestamp"));
            }
            return this.fetch({
                url: url,
                update: true,
                remove: false
            });
        },

        loadMissing: function (since, until) {
            var url = this.url();
            url += '?since='+encodeURIComponent(since);
            url += '&until='+encodeURIComponent(until);
            return this.fetch({
                url: url,
                update: true,
                remove: false
            });
        }

    })
);