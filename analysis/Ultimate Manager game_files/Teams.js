GZ.Collections.Teams = GZ.CurrentCollection.extend({

    model: GZ.Models.Team,

    url: function () {
        var url = GZ.Backend + "/users/" + (this.user_id || 'me') + '/teams';
        if (!_.isUndefined(this.round_id)) {
            url += '?round_id='+encodeURIComponent(this.round_id);
        }
        return url;
    },

    initialize: function (models, options) {
        if (!_.isUndefined(options) && !_.isUndefined(options.user_id)) {
            this.user_id = options.user_id;
        }
    }

});