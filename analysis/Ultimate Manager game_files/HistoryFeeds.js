GZ.Collections.HistoryFeeds = GZ.Collection.extend({

    model: GZ.Models.LiveFeed,

    url: function () {
        var url = GZ.Backend + "/users/" + (this.user_id || 'me') + '/teams/' + this.team_id + '/history';
        if (!_.isUndefined(this.since)) {
            url += '?since='+encodeURIComponent(this.since);
        }
        return url;
    },

    comparator: function(feed) {
        return -feed.get("timestamp");
    }

});