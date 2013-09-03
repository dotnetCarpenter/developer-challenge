GZ.Collections.JoinedGroups = GZ.Collections.Groups.extend({

    url: function () {
        return GZ.Backend + "/teams/"+this.team_id+"/groups";
    },

    parse: function() {
        var response = GZ.Collections.Groups.prototype.parse.apply(this, arguments);

        return _.map(response, function (group) {
            if (!_.isUndefined(group.membership[this.team_id])) {
                if (_.contains(["invited", "request"], group.membership[this.team_id])) {
                    group.badge_count = '!';
                }
            }
            return group;
        }, this);
    }

});