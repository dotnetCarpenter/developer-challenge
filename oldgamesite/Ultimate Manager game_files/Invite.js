GZ.Views.Modals.Invite = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'invite',
    template: '#template-modals-invite',

    ui: {
        searchField: 'input[name=search_term]',
        publicUrlField: 'input[name=public_url]'
    },

    events: {
        'keyup input[name=search_term]': 'filter',
        'click input[name=public_url]': 'selectPublicUrl',
        'click button': 'invite'
    },

    facebookFriends: null,
    currentFilter: null,

    initialize: function(options) {
        _.bindAll(this);
        var that = this;

        this.facebookList = new GZ.Views.Modals.InviteFriendList({
            model: new Backbone.Model({
                headline: GZ.helpers.i18n.gettext("Facebook friends"),
                className: 'facebook',
                icon: 'facebook-sign',
                emptyViewText: GZ.helpers.i18n.gettext("Invite friends from Facebook"),
                emptyViewTextClickable: true
            }),
            collection: new Backbone.Collection([])
        });

        this.facebookList.on('itemview:emptyClick', this.connectWithFacebook, this);

        this.searchList = new GZ.Views.Modals.InviteFriendList({
            model: new Backbone.Model({
                headline: GZ.helpers.i18n.gettext("Search result"),
                className: 'search',
                icon: 'search',
                emptyViewText: GZ.helpers.i18n.gettext("Type 3 or more characters to search for people")
            }),
            collection: new Backbone.Collection([])
        });

        this.searchList.on('itemview:selectionChange', _.bind(this.toggleSelection, this));

        this.selectedList = new GZ.Views.Modals.InviteFriendList({
            model: new Backbone.Model({
                headline: GZ.helpers.i18n.gettext("Selected people"),
                className: 'selected',
                icon: 'group',
                emptyViewText: GZ.helpers.i18n.gettext('None')
            }),
            collection: new Backbone.Collection([])
        });

        this.selectedList.on('itemview:selectionChange', _.bind(this.toggleSelection, this));

        GZ.helpers.facebook.getLoginStatus()
            .done(this.loadFacebookFriends)
            .fail(function(response){
                var notConnectedStatuses = ['not_authorized', 'unknown'];
                if (_.isString(response) && _.indexOf(notConnectedStatuses, response) > -1) {
                    that.facebookNotConnected();
                }
            });
    },

    serializeData: function(){
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this, arguments);

        data.publicUrl = this.model.publicUrl();

        return data;
    },

    facebookNotConnected: function() {
        this.facebookList.model.set({
            emptyViewText: GZ.helpers.i18n.gettext("Invite friends from Facebook"),
            emptyViewTextClickable: true
        });
    },

    connectWithFacebook: function() {
        GZ.helpers.facebook.login({ scope: 'email' })
                           .pipe(function(userInfo){
                               GZ.User.save({
                                   facebook_id: userInfo.userID
                               });
                           })
                           .pipe(this.loadFacebookFriends);
    },

    onRender: function() {
        this.$('.search-lists').append(this.facebookList.render().el)
                               .append(this.searchList.render().el);
        this.$('.selected-list').append(this.selectedList.render().el);

        FB.XFBML.parse(this.el);
        /*jshint expr:true */
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    },

    loadFacebookFriends: function() {
        //this.facebookList.close();

        var d = new $.Deferred(),
            that = this;

        FB.api('/me/friends', function(response){
            that.facebookFriends = _.sortBy(response.data, function(item) {
                return item.name;
            }).map(function(item){
                item.name_lowercase = item.name.toLowerCase();
                item.type = 'facebook';
                return item;
            });
            that.facebookList.model.set({
                emptyViewText: GZ.helpers.i18n.gettext("No Facebook friend was matching your search criteria."),
                emptyViewTextClickable: false
            });
            that.filterFacebookFriends('');

            d.resolve();
        });

        return d.promise();
    },

    filter: function() {
        if (!this.applyFilter) {
            this.applyFilter = _.debounce(function(){
                var filterValue = $.trim(this.ui.searchField.val());
                if (filterValue.length < 2) {
                    return;
                }

                filterValue = $.trim(filterValue);

                if (filterValue === this.currentFilter) return;
                this.currentFilter = filterValue;

                this.executeSearchWithFilter(filterValue.toLowerCase());
            }, 200);
        }

        this.applyFilter();
    },

    executeSearchWithFilter: function(filter) {
        this.searchForManagers(filter)
            .pipe(this.filterFacebookFriends)
            .done(_.bind(function(results){
                this.searchList.collection.reset(results);
                this.searchList.model.set({
                    emptyViewText: GZ.helpers.i18n.gettext("No search results found.")
                });
            }, this));
    },

    filterFacebookFriends: function(options) {
        var d = $.Deferred(),
            that = this,
            filter = options.filter,
            filteredFriends = _.filter(this.facebookFriends, function(item) {
                return (item.name_lowercase.indexOf(filter) > -1);
            }),
            limit = Math.min(filteredFriends.length, 10),
            collection = [],
            model,
            search_result = _.reject(options.result, function(item){
                return !!_.find(that.facebookFriends, function(friend){
                    return friend.id == item.facebook_id;
                });
            }),
            all_results = _.sortBy(_.union(filteredFriends, search_result), function(item){
                return item.name;
            });

        d.resolve(all_results);

        return d.promise();
    },

    searchForManagers: function(filter) {
        // Because the search is currently case sensitive, we want to ensure that the search start with a capital letter, to improve UX
        var d = new $.Deferred(),
            that = this;

        this.searchList.model.set({
            emptyViewText: GZ.helpers.i18n.gettext("Loading")
        });

        $.get(GZ.Backend + '/users',
            { search: filter, league_id: GZ.Leagues.getCurrent().id },
            function(data){
                for (var i = 0, n = data.response.length; i < n; i++) {
                    data.response[i].type = 'search';
                }
                d.resolve({ result: data.response, filter: filter });
            });

        return d.promise();
    },

    invite: function() {
        var users = [],
            facebook_users = [];

        facebook_users = _.pluck(this.selectedList.collection.where({ type: 'facebook' }), "id");
        users = _.pluck(this.selectedList.collection.where({ type: 'search' }), "id");

        this.model.inviteUsers(users, facebook_users)
            .then(_.bind(function (data) {
                var success_message = GZ.helpers.i18n.gettext("The invites have been sent");

                if (_.isUndefined(data.response) || _.isUndefined(data.response.unknown_facebook_ids) || data.response.unknown_facebook_ids.length === 0) {
                    GZ.helpers.modal.close();
                    return alert(success_message);
                }

                FB.ui({
                    method: 'apprequests',
                    message: 'Join my group: ' + this.model.get('name'),
                    to: data.response.unknown_facebook_ids.join(',')
                }, function(){
                    GZ.helpers.modal.close();
                    alert(success_message);
                });

                GZ.helpers.track.event("Groups",
                                       "Invites",
                                       "Sent",
                                       users.length+facebook_users.length);
            }, this),
            function () {
                alert("An error occured.");
            });
    },

    selectPublicUrl: function() {
        this.ui.publicUrlField.select();
    },

    toggleSelection: function(evt, selected) {
        var method = selected ? 'add' : 'remove';
        this.selectedList.collection[method](evt.model);
    }

});