GZ.Views.LiveScoreMatchEvent = Backbone.Marionette.ItemView.extend({

    templateHelpers: function () {
        var data = {},
            match;
        if (this.model.has("player")) {
            match = GZ.Leagues.findMatch(this.model.get("match_id"));
            data.isHome = (this.model.get("player").team_short_name === match.get("home").shortname);
        }
        return data;
    },

    getTemplate: function () {
        if (this.shouldRender()) {
            return "#live-score-match-event";
        }
        return "#live-score-match-event-no-display";
    },

    shouldRender: function () {
        if ( !this.model.get("player") ) {
            return false;
        }

        isCancelled = this.model.collection.reduce(function(currentValue, evt){
            if ( evt.get("is_error") === true && evt.get("event_id") === this.model.get("event_id") ) {
                return true;
            }
            return currentValue;
        }, false, this);

        if (isCancelled) {
            return false;
        }
        return true;
    }

});

GZ.Views.LiveScoreMatchEmptyView = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    template: '#live-score-no-events'

});