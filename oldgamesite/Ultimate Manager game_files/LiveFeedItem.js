GZ.Views.LiveFeedItem = Backbone.Marionette.ItemView.extend({

    getTemplate: function(){
        var story_type = (this.model.get('data_type') == 'event' ? 'match_event' : 'game_action'),
            name_parts = ['#livefeed-item', story_type];

        if (story_type == 'match_event') {
            name_parts.push(this.model.get('event_type'));
        }

        return name_parts.join('-');
    },

    matchEvents: {
        texts: {
            period: {
                "PreMatch": GZ.helpers.i18n.none_gettext("Starting soon"),
                "FirstHalf": GZ.helpers.i18n.none_gettext("Match Started"),
                "HalfTime": GZ.helpers.i18n.none_gettext("Halftime"),
                "SecondHalf": GZ.helpers.i18n.none_gettext("Second Half Started"),
                "FullTime": GZ.helpers.i18n.none_gettext("Match Ended")
            },
            booking: {
                "Yellow": GZ.helpers.i18n.none_gettext("Yellow Card"),
                "Red": GZ.helpers.i18n.none_gettext("Red Card"),
                "StraightRed": GZ.helpers.i18n.none_gettext("Straight Red Card")
            }
        },
        manipulators: {
            period: function(data) {
                data.description = GZ.helpers.i18n.gettext(this.matchEvents.texts.period[data.period]);
                data.startingorending = /FirstHalf|SecondHalf/.test(data.period) ? "starting" : "ending";

                return data;
            },
            booking: function(data) {
                data.description = this.matchEvents.texts.booking[data.booking_type];
                return data;
            }
        }
    },

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        if (data.data_type == 'event') {
            return this.serializeMatchEventData(data);
        }

        return this.serializeGameActionData(data);
    },

    serializeMatchEventData: function(data) {
        if (this.matchEvents.manipulators[data.event_type]) {
            data = _.bind(this.matchEvents.manipulators[data.event_type], this)(data);
        }
        return data;
    },

    serializeGameActionData: function(data) {
        if (data.is_error) {
            data.title = GZ.helpers.i18n.gettext("Correction of previous action")+": "+GZ.helpers.ui.getReadableActionName(data.action_name);
            data.action_name = "referee_error";
        } else {
            data.title = "";
        }
        data.period = data.period==="FirstHalf" ? "1" : "2";

        if (GZ.app.reqres.request("team:isCaptain", data.player_id)) {
            data.total_points *= 2;
        }

        return data;
    }

});