GZ.Models.League = GZ.RelationalModel.extend(
    _.extend({}, GZ.Mixins.SocketBindings, {

    urlRoot: GZ.Backend + "/leagues",

    relations: [
        {
            key: "rounds",
            type: Backbone.HasMany,
            relatedModel: GZ.Models.LeagueRound,
            collectionType: GZ.Collections.LeagueRounds
        }
    ],

    initialize: function() {
        if (this.id) {
            this.set('status', new GZ.Models.LeagueStatus(null, { league_id: this.id }));

            this.set('squads', new GZ.Collections.Squads(null, { league_id: this.id }));

            this.initSocket();
        }
    },

    subscribe: function () {
        this.bindToEndpoint('/events', this.handleMatchEvent, this);
        this.subscribeId('/events', this.id);
    },

    unsubscribe: function () {
        this.unbindToEndpoint('/events', this.handleMatchEvent, this);
        this.unsubscribeId('/events', this.id);
    },

    handleMatchEvent: function (data) {
        if (!_.isUndefined(data.event_type)) {
            this.getStatRound().processMatchEvent(data);
            GZ.app.vent.trigger('league:'+this.id+':round:match_event:processed', data);
        }
    },

    fetchDeep: function () {
        return $.when(this.get('status').startTicker(),
                      this.get('squads').fetch());
    },

    onCurrent: function () {
        GZ.app.reqres.setHandler("league:round:isLast", this.isLastRound, this);
        GZ.app.reqres.setHandler("league:status:matchday", this.getMatchday, this);
        GZ.app.reqres.setHandler("league:status:window:isFinal", this.isInFinalMode, this);
        GZ.app.reqres.setHandler("league:status:window:isTransfer", this.isInTransferMode, this);
        GZ.app.reqres.setHandler("league:status:window:isMatch", this.isInMatchMode, this);
    },

    getStrippedCompetitionId: function () {
        return this.get('competition_id').split('_')[0];
    },

    getSeasonName: function () {
        var season_name = this.get('season_name');

        // Replay league, handle accordingly for UI
        if (this.isReplay()) {
            // Make replay_2012 look like: Season 2012/2013
            season_name = season_name.replace('replay_', '');
            season_name = "Season "+season_name+"/"+(parseInt(season_name, 10)+1);
            season_name += " ("+this.get('competition_id').split("_")[1].substring(0,7)+")";
        }
        return season_name;
    },

    isReplay: function () {
        if (this.has('season_name')) {
            return this.get('season_name').indexOf("replay_") !== -1;
        }
        return false;
    },

    getMatchday: function () {
        return this.get("status").get("matchday");
    },

    getCurrentRound: function() {
        var round = this.getRoundForMatchday(this.getMatchday());

        if (round === undefined) {
            round = this.get('rounds').last();
        }

        return round;
    },

    getStatRound: function() {
        var round = this.getRoundForMatchday(this.get("status").get("statround"));

        if (round === undefined) {
            round = this.getCurrentRound();
        }

        return round;
    },

    getRoundForMatchday: function (matchday) {
        return this.get("rounds").find(function (round) {
            return round.get("matchday") == matchday;
        });
    },

    isLastRound: function () {
        return this.getCurrentRound() == this.get("rounds").last();
    },

    isInFinalMode: function () {
        return !this.get("status").inTransfer() && !this.get("status").inMatch();
    },

    isInTransferMode: function () {
        return this.get("status").inTransfer();
    },

    isInMatchMode: function () {
        return this.get("status").inMatch();
    },

    getRoundsAfter: function (timestamp) {
        return this.get('rounds').filter(function(item){
            return item.get('game_window').start_time > timestamp;
        });
    }

}));