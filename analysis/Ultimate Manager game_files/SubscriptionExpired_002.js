GZ.Models.SubscriptionExpired = GZ.Model.extend({

    initialize: function(attrs) {
        if (!attrs) return;

        var active = attrs.paymentplans.getActive(),
            props = {};

        if (active) {
            var now = new Date().getTime(),
                exp = active.get('expiration_date'),
                sub = active.get('subscription_date') || (exp - 14 * 86400 * 1000),
                trial_length = exp - sub,
                trial_elapsed = now - sub;

            // Find 5 rounds after sub
            var rounds = _.sortBy(GZ.Leagues.getCurrent().getRoundsAfter(sub), function(round){ return round.get('matchday'); }).slice(0, 5),
                markers = [],
                last_round_gw = rounds.length > 1 ? _.last(rounds).get('game_window') : null,
                stop_date = last_round_gw ? (last_round_gw.start_time + (last_round_gw.end_time - last_round_gw.start_time) / 2) : (exp + 1 * 86400 * 1000),
                bar_length = stop_date - sub,
                progress_width = this.createMarker(trial_elapsed / bar_length * 100, 0).pos;

            markers.push(this.createMarker(0, 0, 'start', GZ.helpers.i18n.gettext("Start of trial")));
            markers.push(this.createMarker(trial_length / bar_length * 100, 0, 'end', GZ.helpers.i18n.gettext("End of trial")));

            _.each(rounds, _.bind(function(round){
                var width = round.get('game_window').end_time - round.get('game_window').start_time,
                    pos = round.get('game_window').start_time - sub,
                    args = [
                        pos / bar_length * 100,
                        width / bar_length * 100,
                        'period',
                        GZ.helpers.i18n.gettext("Round") + ' ' + round.get('matchday'),
                        new Date(round.get('game_window').start_time).toLocaleDateString()
                    ];

                markers.push(this.createMarker.apply(this, args));
            }, this));

            props = {
                mode: 'trial',
                days_left: Math.ceil((trial_length - trial_elapsed) / 86400000),
                markers: markers,
                progress_width: progress_width
            };
        } else {
            props = {
                mode: (attrs.paymentplans.length > 1 ? 'subscription' : 'trial'),
                days_left: 0
            };
        }

        this.set(props);
    },

    createMarker: function(pos, width, type, label, subLabel) {
        var actualWidthAvailable = 90,
            expectedWidth = 100,
            diff = expectedWidth - actualWidthAvailable;

        function recalculatePlot(plot, add) {
            return plot / expectedWidth * actualWidthAvailable + add;
        }

        return {
            pos:      Math.round(recalculatePlot(pos, diff) * 10) / 10,
            width:    Math.round(recalculatePlot(width, 0) * 10) / 10,
            type:     type,
            label:    label,
            subLabel: subLabel
        };
    },

    calculatePosition: function(groundZero, highRise, value) {
        return value / (highRise - groundZero) * 100;
    }

});