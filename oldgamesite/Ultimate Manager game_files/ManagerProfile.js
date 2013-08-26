GZ.Views.ManagerProfile = Backbone.Marionette.Layout.extend({

    template: "#template-manager-profile", // Template: manager-profile.html

    regions: {
        user: "#profile-user",
        team: "#profile-team",
        groups: "#profile-groups"
    },

    loading: false,

    initialize: function (opts) {
        if (opts.manager) {
            this.userView = new GZ.Views.ManagerProfileUser({
                model: opts.manager
            });
        }
        if (opts.teams) {
            this.teamView = new GZ.Views.ManagerProfileTeams({
                collection: opts.teams
            });
        }
       // this.groupsView = new GZ.Views.ManagerProfileGroups();
    },

    onShow: function () {
        if (!_.isUndefined(this.userView)) {
            this.user.show(this.userView);
        }
        if (!_.isUndefined(this.teamView)) {
            this.team.show(this.teamView);
        }
        // this.groups.show(this.groupsView);
    },

    onRender: function () {
        this.$el.attr('id', 'manager-profile');
        this.$el.toggleClass('loading', this.loading);
    },

    setLoading: function (loading, immediate) {
        // Convert to bool if not.
        this.loading = !!loading;
        if (!!immediate) {
            this.$el.toggleClass('loading', this.loading);
        }
    }

});
