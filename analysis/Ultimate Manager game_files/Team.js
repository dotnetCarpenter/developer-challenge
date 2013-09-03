GZ.Models.Team = GZ.Model.extend(_.extend({}, GZ.ModelValidation, GZ.Mixins.SocketBindings, {

    url: function () {
        var url = GZ.Backend + "/users/" + (this.get('user_id') || 'me') + '/teams';
        if (!this.isNew()) {
            url += '/'+encodeURIComponent(this.id);
        }
        if (this.has("round_id")) {
            url += '?round_id='+encodeURIComponent(this.get('round_id'));
        }
        return url;
    },

    defaults: function () {
        // Must be a function to ensure we don't use the same
        // collection of players across all Team models.
        return {
            "name": "",
            "formation": "343",
            "players": new GZ.Collections.TeamPlayers(),
            "score": {
                "money": 100000000, // Initial bank for team
                "captain_round_earnings": 0,
                "round_earnings": 0,
                "earnings": 0,
                "captain_earnings": 0
            }
        };
    },

    jsonFilters: {
        create: ['players', 'captain', 'name', 'formation', 'league_id'],
        update: ['players', 'captain', 'name', 'formation']
    },

    validations: {
        "name": [
            {
                validator: function (val) { return (val.length >= 3); },
                msg: GZ.helpers.i18n.none_gettext("Please allow yourself a longer team name. A minimum 3 characters.")
            },
            {
                validator: function (val) { return (val.length <= 32); },
                msg: GZ.helpers.i18n.none_gettext("The team name is too long. The maximum allowed length is 32 characters.")
            }
        ]
    },

    initialize: function() {
        this.initSocket();
        this.listenTo(this, "change", this.updateCaptain, this);
        this.listenTo(this.get("players"), "add", this.triggerPlayersChangeEvent, this);
        this.listenTo(this.get("players"), "remove", this.triggerPlayersChangeEvent, this);
        this.listenTo(this.get("players"), "reset", this.triggerPlayersChangeEvent, this);
    },

    subscribe: function () {
        this.bindToEndpoint('/models', this.onModelUpdate, this);
        this.subscribeId('/models', this.id);
    },

    unsubscribe: function () {
        this.unbindToEndpoint('/models');
        this.unsubscribeId('/models', this.id);
    },

    isOwnTeam: function () {
        return this.get('user_id') == GZ.User.id;
    },

    onModelUpdate: function (item) {
        if (item.model === "player") {
            var player = GZ.helpers.player.find(item.player_id),
                playerStat,
                stat;

            if (player) {
                var pointsDelta = item.score - player.get("value");

                // Update global Player model
                player.set({ value: item.score });

                var oldEarnings = parseInt(player.get("round_earnings") || 0, 10);
                var newEarnings = "" + (oldEarnings + pointsDelta);
                player.set({ round_earnings: newEarnings });

                GZ.app.vent.trigger("model:player", item);
            }

        } else if (item.model === "pitch_status") {
            this.updatePitchStatus(item);
        }

        return item;
    },

    triggerPlayersChangeEvent: function () {
        this.trigger("change:players", this.get("players"));
    },

    reset: function () {
        var d;
        if (this.id) {
            return this.fetch().then(_.bind(function () {
                this.changed = {};
            }, this));
        }
        d = new $.Deferred();
        this.set(_.result(this, "defaults"));
        this.changed = {};
        d.resolve();
        return d.promise();
    },

    set: function (data, options) {
        var new_players;
        if (_.isArray(data.players)) {
            new_players = _.map(data.players, function (player) {
                var teamPlayer = { player: player };
                teamPlayer.captain = (player.id == data.captain);
                teamPlayer.pitchStatus = _.find(data.pitch_status, function (status) {
                    return status.id == player.id;
                });
                return new GZ.Models.TeamPlayer(teamPlayer);
            }, this);
            data.players = (this.get("players") || new GZ.Collections.TeamPlayers());
            data.players.on("add remove reset", function (collection) {
                this.trigger("change:players", this, collection);
                this.trigger("change", this);
            }, this);
            data.players.reset(new_players);
        }
        return GZ.Model.prototype.set.call(this, data, options);
    },

    toJSON: function () {
        var json = GZ.Model.prototype.toJSON.apply(this, arguments);
        if (_.isObject(json.players)) {
            json.players = json.players.map(function (player) { return player.get("id"); });
        }
        return json;
    },

    // Add player to team
    addPlayer: function (player) {
        var teamPlayer = { player: player };
        teamPlayer.captain = (player.id == this.get("captain"));
        teamPlayer.pitchStatus = _.find(this.get("pitch_status"), function (status) {
            return status.id == player.id;
        });
        this.get("players").add(new GZ.Models.TeamPlayer(teamPlayer));
        this.decrementMoney(player.get("value"));
    },

    removePlayer: function (player) {
        if (!_.isUndefined(this.get("captain")) && this.get("captain") === player.id) {
            this.set("captain", undefined);
        }
        this.get("players").remove(player);
        this.incrementMoney(player.get("value"));
    },

    decrementMoney: function (decrValue) {
        // Decrement by giving increment a negative value.
        this.incrementMoney(-decrValue);
    },

    incrementMoney: function (incrValue) {
        var score = _.clone(this.get('score'));
        score.money += incrValue;
        this.set('score', score);

    },

    setMoney: function (newValue) {
        this.get('score').money = newValue;
        this.trigger('change:score', newScore);
    },

    updateCaptain: function () {
        var newCaptian;
        if (!_.isUndefined(this.changed.captain) && !_.isNull(this.changed.captain)) {
            newCaptian = this.changed.captain;
            if (_.isObject(this.get("players"))) {
                this.get("players").forEach(function (model) {
                    if (model.get("id") == newCaptian) {
                        model.set('captain', true);
                    } else {
                        model.set('captain', false);
                    }
                });
            }
        }
        // Captain is no longer present in our player list => reset the value silently.
        if (this.has("players") && !_.contains(this.get("players").pluck("id"), this.get("captain"))) {
            this.set("captain", undefined, {silent: true});
        }
    },

    // Validates the team
    // A team is valid if:
    //   1. It has 11 players
    //   2. A captain is set
    //   3. The player-count on each position in the formation is valid.
    //   4. It has at most 4 players from the same squad.
    validateTeam: function () {
        var players = this.get("players"),
            formation;

        if ( this.bankBalance() < 0 ) {
            return GZ.helpers.i18n.gettext("Insufficient funds in bank.");
        }

        if (this.get("players").length !== 11) {
            return GZ.helpers.i18n.gettext("The team must have 11 players.");
        }

        if ( !this.get("captain") ) {
            return GZ.helpers.i18n.gettext("The team must have a captain.");
        }

        // Check that the current formation is valid
        formation = _.clone( this.formations()[ this.get("formation") ] );
        players.each(function(p){
            formation[ p.get("position") ]--;
            if ( formation[ p.get("position") ] < 0) {
                return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("Too many players in position '%s'"), [p.get("position")]);
            }
        });

        // Check that we will have - at most - 4 players from the same squad
        var playersBySquad = players.groupBy(function (p) {
            return p.get("squad").get("id");
        });
        var squadMax = _.reduce(playersBySquad, function (max, obj) {
            return (obj.length > max) ? obj.length : max;
        }, 0);
        if (squadMax > 4) {
            return GZ.helpers.i18n.gettext("You can't have more than 4 players on your team from each squad.");
        }

    },

    formations: function () {
        return {
            '442': {'Goalkeeper': 1, 'Defender': 4, 'Midfielder': 4, 'Forward': 2},
            '433': {'Goalkeeper': 1, 'Defender': 4, 'Midfielder': 3, 'Forward': 3},
            '451': {'Goalkeeper': 1, 'Defender': 4, 'Midfielder': 5, 'Forward': 1},
            '532': {'Goalkeeper': 1, 'Defender': 5, 'Midfielder': 3, 'Forward': 2},
            '541': {'Goalkeeper': 1, 'Defender': 5, 'Midfielder': 4, 'Forward': 1},
            '352': {'Goalkeeper': 1, 'Defender': 3, 'Midfielder': 5, 'Forward': 2},
            '343': {'Goalkeeper': 1, 'Defender': 3, 'Midfielder': 4, 'Forward': 3}
        };
    },

    canChangeToFormation: function(formationName) {
        var formation = this.formations()[formationName],
            restrict = _.clone(formation);

        this.get('players').each(function(player){
            restrict[ player.get("position") ]--;
        });

        return (_.min(restrict) >= 0);
    },

    canPlayerBeAdded: function(player) {
        var currentPlayers = this.get("players");

        if ( currentPlayers.get(player.id) ) {
            // We already have the player
            return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("%s is already on your team"), [GZ.helpers.ui.playerNickname(player)]);
        }

        var currentFormation = _.clone( this.formations()[ this.get("formation") ] );
        currentPlayers.each(function(p){
            currentFormation[ p.get("position") ]--;
        });

        if (currentFormation[ player.get("position") ] < 1) {
            // This position has been filled with players
            return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("You can't add more players to the position: %s"), GZ.helpers.ui.playerPosition(player.get("position")));
        }

        if (currentPlayers.length < 4) return true;

        // Check that we will have - at most - 4 players from the same squad
        var maxSquadCount = _.chain(
            currentPlayers.map(function(player){ return player.get("squad").get("name"); }))
            .push(player.get("squad").get("name"))
            .reduce(function(counts, squad){
                counts[squad] = (counts[squad] || 0) + 1;
                return counts;
            }, {})
            .max().value();

        if (maxSquadCount > 4) {
            return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("You can't have more than 4 players on your team from %s"), [player.get("squad").get("name")]);
        }

        return true;
    },

    /*
     * Update the pitch status on socket updates.
     * If player already has status => change status
     * If player has no status => add status
     */
    updatePitchStatus: function (player) {
        var i,
            index = -1,
            pitchStatus = this.get("pitch_status"),
            player_model = this.get('players').get(player.player_id);
        if (!_.isUndefined(pitchStatus)) {
            for(i=0; i<pitchStatus.length; i++) {
                if (pitchStatus[i].id === player.player_id) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                pitchStatus[index] = player.pitch_status;
            } else {
                pitchStatus.push(player.pitch_status);
            }
            this.set("pitch_status", pitchStatus);
        }
        if (!_.isUndefined(player_model)) {
            player_model.set('pitchStatus', player.pitch_status);
        }
    },

    hasPlayer: function(player_id) {
        return !_.isUndefined(this.get("players").get(player_id));
    },

    hasGoalkeeper: function () {
        return (this.get("players").findByPosition("Goalkeeper").length > 0);
    },

    hasCaptain: function () {
        return !_.isUndefined(this.get('captain'));
    },

    isFull: function () {
        return this.get('players').length == 11;
    },

    isPlayersValid: function () {
        var error = this.validateTeam();
        return !error;
    },

    setCaptain: function (player_id) {
        if (!this.isCaptain(player_id)) {
            this.set("captain", player_id);
        }
    },

    isCaptain: function (player_id) {
        return ( this.get("captain") === player_id );
    },

    isEditable: function () {
        return GZ.app.reqres.request("league:status:window:isTransfer") || this.isNew();
    },

    bankBalance: function () {
        return this.get('score').money;
    },

    getGroups: function () {
        if (_.isUndefined(this.joinedGroups)) {
            this.joinedGroups = new GZ.Collections.JoinedGroups();
            this.joinedGroups.team_id = this.id;
        }
        return this.joinedGroups;
    },

    getLiveFeed: function () {
        if (_.isUndefined(this.liveFeed)) {
            this.liveFeed = new GZ.Collections.LiveFeed();
        }
        this.liveFeed.team_id = this.id;
        this.liveFeed.league_id = this.get('league_id');
        return this.liveFeed;
    },

    getLeague: function () {
        return GZ.Leagues.get(this.get("league_id"));
    },

    getUpcomingMatches: function () {
        var league = this.getLeague(),
            matches = league.getCurrentRound().get("matches"),
            squads = this.get("players").pluck("squad"),
            squadIds = _.unique(_.map(squads, function (s) { return s.get('id'); }));

        return matches.reduce(function (memo, match) {
            if (_.contains(squadIds, match.get("home").squad) ||
                _.contains(squadIds, match.get("away").squad) ) {
                memo.push(match);
            }
            return memo;
        }, []);
    }

}));
