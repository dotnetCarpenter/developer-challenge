GZ.Models.Group = GZ.Model.extend(_.extend({}, GZ.Mixins.SocketBindings, {

	urlRoot: GZ.Backend + "/groups",
    clientUrlRoot: "/match/group",

    clientUrlWithWall: function(postId) {
        var parts = [this.clientUrl(), 'wall'];
        if (!_.isUndefined(postId)) parts.push(postId);
        return parts.join('/');
    },

    initialize: function() {
        this.initSocket();
        GZ.app.vent.on('notification:group', this.groupEvent, this);
    },

    groupEvent: function(info) {
        var group_id = info[0],
            event_category = info[1],
            event_value = info[2];

        if (this.get('id') != group_id) return;

        if (this.groupEvents[event_category]) {
            return _.bind(this.groupEvents[event_category], this)(event_value);
        }
    },

    isMember: function (team_id) {
        var membership = this.get("membership");
        team_id = team_id || GZ.Teams.getCurrent().id;
        if (!_.isUndefined(membership[team_id]) && membership[team_id] == "member") {
            return true;
        }
        return false;
    },

    groupEvents: {
        join_request: function(value) {
            var new_values = {
                    'requested_join': false,
                    'badge_count': undefined
                };

            if (value == 'accepted') {
                new_values.member = true;
            } else if (value == 'declined') {
                new_values.member = false;
            }

            this.set(new_values);
        }
    },

    subscribe: function () {
        this.bindToEndpoint('/groups', this.onRankingsUpdate, this);
        this.subscribeId('/groups', this.id);
    },

    unsubscribe: function () {
        this.unbindToEndpoint('/groups');
        this.unsubscribeId('/groups', this.id);
    },

    onRankingsUpdate: function (item) {
        if (item.type === "rankings") {
            GZ.app.vent.trigger('group:'+item.id+':rankings', item);
        }
        return item;
    },

	validate: function(attrs) {
		if (attrs.name.length <= 3) {
			return GZ.helpers.i18n.gettext('Group name must be at least 3 characters long');
		}
        if (attrs.name.length > 40) {
            return GZ.helpers.i18n.gettext('Group name can not be more than 40 characters long');
        }
	},

    declineRequest: function(user_id, team_id) {
        // It is actually the same to decline a group request as it is to leave the group.
        this._removeUser(team_id)
            .then(this.apiResponse(this.joinRequestCallback(user_id)));
    },

    publicUrl: function() {
        return location.protocol + '//' + location.host + '/group/' + this.get('id');
    },

    set: function (obj) {
        var team_id = GZ.Teams.getCurrent().id;
        if (!_.isUndefined(obj.membership) && !_.isUndefined(obj.membership[team_id])) {
            obj.membershipStatus = obj.membership[team_id];
        }
        return GZ.Model.prototype.set.apply(this, arguments);
    },

    join: function(team_id) {
        var data = {
            action: 'join',
            team_id: team_id
        };
        return this._request('POST', [this.url(), 'members'].join('/'), data)
            .then(this.apiResponse(_.bind(function(data){
                var membership = this.get('membership');
                if (data.response.request == "pending") {
                    membership[team_id] = "pending";
                    this.set({
                        'membership': membership,
                        'membershipStatus': 'request',
                        'badge_count': '!'
                    });
                } else {
                    membership[team_id] = "member";
                    this.set({
                        'membership': membership,
                        'membershipStatus': 'member'
                    });
                }

                GZ.app.vent.trigger('group:joined', this);
            }, this)));
    },

    leave: function(team) {
        this._removeUser(team.id).then(this.apiResponse(_.bind(function(data){
                GZ.app.vent.trigger('group:left', this);
                var membership = this.get('membership');
                membership[team.id] = "non-member";
                this.set({
                    'membership': membership,
                    'membershipStatus': 'non-member',
                    'member': false,
                    'deleted': false,
                    'badge_count': undefined
                });
            }, this)));
    },

    acceptRequest: function(user_id, team_id) {
        var data = { action: 'accept' };
        return this._request('PUT', [this.url(), 'members', team_id].join('/'), data)
            .then(this.apiResponse(this.joinRequestCallback(user_id)));
    },

    joinRequestCallback: function(userId) {
        return _.bind(function() {
            var requests = this.get('request_teams');

            requests = _.reject(requests, function(item){
                return item.user_id == userId;
            });

            this.set({
                request_teams: requests,
                badge_count: requests.length || undefined
            });
        }, this);
    },

    inviteUsers: function (users, facebook_users) {
        var deferred = new $.Deferred(),
            data = {
                action: 'invite',
                users: users,
                facebook_users: facebook_users
            };
        if (_.isUndefined(users)) {
            deferred.reject("A user list must be provided.");
            return deferred.promise();
        }
        return this._request('POST', [this.url(), 'members'].join('/'), data);
    },

    _request: function (method, url, data) {
        var options = {
            type: method,
            url: url,
            dataType: 'json',
            contentType: 'application/json'
        };
        if (!_.isUndefined(data)) {
            options.data = JSON.stringify(data);
        }
        return $.ajax(options);
    },

    _removeUser: function (userId) {
        return this._request('DELETE', [this.url(), 'members', userId].join('/'));
    }

}));