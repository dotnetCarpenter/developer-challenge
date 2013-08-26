GZ.Collections.Groups = GZ.Collection.extend({

	model: GZ.Models.Group,
	url: function () {
        return GZ.Backend + "/leagues/"+this.league_id+"/groups";
    },

    initialize: function (models, options) {
        if (!_.isUndefined(options) && !_.isUndefined(options.league_id)) {
            this.league_id = options.league_id;
        }
    }

});