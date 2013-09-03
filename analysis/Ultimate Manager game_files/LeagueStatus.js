GZ.Models.LeagueStatus = GZ.RelationalModel.extend({

    countdownInterval: null,
    lastTick: 0,

    url: function() {
        return GZ.Backend + "/leagues/" + this.options.league_id + "/status";
    },

    options: {
        tick: true,
        tickInterval: 5000
    },

    initialize: function (attributes, options) {
        _.bindAll(this, "fetch", "startTicker", "tick", "calculateDelta");

        this.options = _.extend({}, this.options, options);

        this.resyncTimerSlow = _.throttle(this.fetch, 5*60*1000);
        this.resyncTimerFast = _.throttle(this.fetch, 5000);

        this.calculateDelta();
        this.listenTo(this, "sync", this.calculateDelta, this);
    },

    startTicker: function() {
        var d = new $.Deferred();
        this.fetch().then(_.bind(function () {
            this.lastTick = (new Date()).getTime() - this.get("delta");
            this.currentWindow = this.getWindow();
            this.countdownInterval = setInterval(_.bind(this.tick, this), this.options.tickInterval);
            this.tick();
            d.resolve();
        }, this));
        return d;
    },

    tick: function() {
        var tickTime = (new Date()).getTime() - this.get("delta"),
            tickDiff = (tickTime-this.lastTick);

        this.updateCurentWindow();
        this.updateLiveScore();

        if ( this.get("next_window") < tickTime && !this.inFinal()) {
            this.resyncTimerFast();
        } else {
            this.resyncTimerSlow();
        }

        if (tickDiff > 10000) {
            GZ.app.vent.trigger('timer:hickup', tickDiff, this.lastTick);
        }
        GZ.app.vent.trigger("league:status:tick", this);
        this.lastTick = tickTime;
    },

    getWindow: function () {
        if ( this.inMatch() ) {
            return 'game';
        } else if ( this.inTransfer() ) {
            return 'transfer';
        }
        return 'final';
    },

    updateCurentWindow: function () {
        var newWindow = this.getWindow();
        if (newWindow !== this.currentWindow) {
            GZ.app.vent.trigger("league:status:window:changed", newWindow);
            if ( newWindow == "final" ) {
                clearInterval(this.countdownInterval);
            }
        }
        this.currentWindow = newWindow;
    },

    updateLiveScore: function () {
        var matches;
        if (!_.isUndefined(GZ.Leagues)) {
            matches = GZ.Leagues.getCurrent().getStatRound().get("matches");
            matches.each(function (match) {
                var matchPeriod = match.get('period');

                if (_.isUndefined(matchPeriod) || _.isUndefined(match.get("match_events")) || match.get("match_events").length === 0) {
                    return; // Match has not started yet
                }

                if (/^(FullTime|HalfTime|PreMatch)$/.test(matchPeriod)) {
                    return; // No need to update live minutes during breaks
                }

                var periodEvent = match.get('match_events').find(function(e){
                        return (e.get('event_type') == 'period' && e.get('period') == matchPeriod);
                    });
                if (!_.isUndefined(periodEvent)) {
                    var diff = new Date().getTime() - (periodEvent.get('timestamp') - this.get('delta')),
                        base = periodEvent.get('period') == 'FirstHalf' ? 0 : 45;

                    match.set('minute', base + Math.ceil(diff / 60000));
                }
            }, this);
        }
    },

    calculateDelta: function () {
        var now = new Date().getTime(),
            delta = now - this.get("server_date");
        if (_.isNaN(delta)) {
            delta = 0;
        }
        this.set("delta", delta);
    },

    inFinal: function () {
        return !this.inTransfer() && !this.inMatch();
    },

    inTransfer: function () {
        return this.get("in_transfer") || false;
    },

    inMatch: function () {
        return this.get("in_game") || false;
    }

});