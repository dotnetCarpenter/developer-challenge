GZ.AppController = Backbone.Marionette.Controller.extend({

    initialize: function () {
        this.listenTo(GZ.app.vent, "app:showTeam", this._showTeam, this);
        this.listenTo(GZ.app.vent, "app:showTeamGroup", this._showTeam, this);
    },

    _showTeam: function (team, group) {
        var team_id = (team.id || team.cid || team),
            url = "match/" + team_id,
            group_id;
        if (!_.isUndefined(group)) {
            group_id = (group.id || group.cid || group);
            url = url + "/group/"+group_id;
        }
        GZ.router.navigate(url, { trigger: true });
    },

    showTeamRedirect: function() {
        var url = 'team/',
            team = this._getCurrentTeam();
        if (_.isUndefined(team)) {
            url += 'new';
        } else {
            url += team.id;
        }
        GZ.router.navigate(url, { trigger: true, replace: true });
    },

    showTeam: function(team_id) {
        var team = this._getUserTeam(team_id);
        if (_.isUndefined(team)) {
            GZ.router.navigate('team/new', { trigger: true, replace: true });
        }
        this._setCurrentLeague(team.get("league_id"));
        this._setCurrentTeam(team);

        GZ.app.topNavArea.show(new GZ.Views.TopNavLayout({
            active: 'team',
            model: team
        }));

        GZ.app.mainArea.show(new GZ.Views.TeamScreen({
            model: team
        }));

        GZ.helpers.track.pageview();
    },

    selectLeague: function () {
        var team = this._newTeam();

        GZ.app.topNavArea.show(new GZ.Views.TopNavLayout({
            active: 'team',
            model: team
        }));

        GZ.app.mainArea.show(new GZ.Views.LeagueSelector({
            collection: GZ.Leagues
        }));
    },

    createTeam: function (league_id) {
        var team = this._newTeam();
        this._setCurrentLeague(league_id);
        team.set('league_id', league_id);

        if (GZ.app.reqres.request("league:status:window:isMatch") && GZ.app.reqres.request("league:round:isLast")) {
            alert(GZ.helpers.i18n.gettext('The league is in the last round. You cannot set up a team.'));
        }
        if (GZ.app.reqres.request("league:status:window:isFinal")) {
            alert(GZ.helpers.i18n.gettext('The league is over. You cannot set up a team.'));
        }

        GZ.app.topNavArea.show(new GZ.Views.TopNavLayout({
            active: 'team',
            model: team
        }));

        GZ.app.mainArea.show(new GZ.Views.TeamScreen({
            model: team
        }));

        GZ.helpers.track.pageview();

        if (GZ.Teams.length === 0) {
            GZ.helpers.tours.welcomeTour.startTour();
            GZ.config.showLivefeedTour = true;
        }
    },

    showMatchRedirect: function() {
        var url,
            team = this._getCurrentTeam();
        if (_.isUndefined(team)) {
            url = 'team/new';
        } else if (team.isNew()) {
            url = 'team/' + team.cid;
        } else {
            url = 'match/' + team.id;
        }
        GZ.router.navigate(url, { trigger: true, replace: true });
    },

    showMatch: function(team_id) {
        var team = this._getTeam(team_id),
            teamPromise = team.fetch();
        teamPromise.fail(function () {
            GZ.router.navigate("/", { trigger: true, replace: true });
        });
        teamPromise.done(_.bind(function () {
            if (!_.isUndefined(team) && team.isNew()) {
                this.navigate("team/"+team.cid, { trigger: true});
                return;
            }

            if (team.get("user_id") == GZ.User.id) {
                if (!_.contains(GZ.Teams.pluck('id'), team.id)) {
                    GZ.router.navigate("/", { trigger: true, replace: true });
                    return;
                }
                this._setCurrentLeague(team.get("league_id"));
                if (team.get("matchday") > GZ.Leagues.getCurrent().getStatRound().get("matchday")) {
                    team = this._getTeam(team_id, GZ.Leagues.getCurrent().getStatRound().id);
                    team.fetch();
                } else {
                    this._setCurrentTeam(team);
                }
            }

            GZ.app.topNavArea.show(new GZ.Views.TopNavLayout({
                active: 'match',
                model: team
            }));

            GZ.app.mainArea.show(new GZ.Views.MatchScreen({
                model: team,
                url: '/'+Backbone.history.getFragment()
            }));

            GZ.helpers.track.pageview();

            if (GZ.config.showLivefeedTour) {
                GZ.helpers.tours.livefeedTour.startTour();
                GZ.config.showLivefeedTour = false;
            }
        }, this));
    },

    _newTeam: function () {
        return new GZ.Models.Team();
    },

    _getTeam: function (id, round_id) {
        var team = this._getUserTeam(id);
        if (_.isUndefined(team) || !_.isUndefined(round_id)) {
            team = new GZ.Models.Team( { id: id } );
            if (!_.isUndefined(round_id)) {
                team.set('round_id', round_id);
            }
        }
        return team;
    },

    _getUserTeam: function (id) {
        return GZ.Teams.get(id);
    },

    _setCurrentTeam: function (team) {
        return GZ.Teams.setCurrent(team);
    },

    _getCurrentTeam: function () {
        return GZ.Teams.getCurrent();
    },

    _setCurrentLeague: function (league) {
        return GZ.Leagues.setCurrent(GZ.Leagues.get(league));
    }

});

GZ.AppRouter = Backbone.Marionette.AppRouter.extend({

    appRoutes: {
        "team":                       "showTeamRedirect",
        "team/new":                   "selectLeague",
        "team/new/:league_id":        "createTeam",
        "team/:team_id":              "showTeam",
        "match":                      "showMatchRedirect",
        "match/:team_id(/*args)":     "showMatch"
    },

    routes: {
        "*splat":   "defaultRoute"
    },

    modals: {
        "help":     "help",
        "account":  "account"
    },

    initialize: function () {
        this.manager = new Backbone.Marionette.RegionManager();
        this.manager.addRegion("main", "#maincontent");

        // Previously we used "navigate" to figure out if we needed to close
        // a tour or not, this however did not work when using the browser back
        // buttons. Instead we have hooked into the route function and added
        // a "before:route" trigger that stops all tours.
        this.listenTo(this, "before:route", function () {
            GZ.helpers.tours.welcomeTour.stopCurrentTour();
            GZ.helpers.tours.livefeedTour.stopCurrentTour();
        }, this);
    },

    route: function (route, name, callback) {
        // This is a copy of the backbone route function
        // Used to add the before:route trigger.
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (!callback) callback = this[name];
        Backbone.history.route(route, _.bind(function(fragment) {
          var args = this._extractParameters(route, fragment);

           // Only additional line compared to original function
          this.trigger('before:route', name, args);

          if (callback) { callback.apply(this, args); }
          this.trigger.apply(this, ['route:' + name].concat(args));
          this.trigger('route', name, args);
          Backbone.history.trigger('route', this, name, args);
        }, this));
        return this;
    },

    navigate: function(fragment, options) {
        var warning;
        if (this.modals[fragment]) {
            return this[this.modals[fragment]]();
        }

        if (GZ.app.reqres.hasHandler('router:canNavigate')) {
            warning = GZ.app.reqres.request("router:canNavigate");
            if (!!warning) {
                var c = confirm(warning);
                if (!c) return;
            }
        }
        return Backbone.Router.prototype.navigate.apply(this, arguments);
    },

    defaultRoute: function () {
        GZ.router.navigate('match', {
            trigger: true,
            replace: true
        });
    },

    help: function() {
        var modal = new GZ.Views.Modals.Help();
        GZ.helpers.modal.open(modal);
        GZ.helpers.track.pageview();
    },

    account: function() {
        if (_.isUndefined(GZ.User.get('id'))) return;
        GZ.helpers.modal.open(new GZ.Views.Modals.Account({
            model: GZ.User
        }));
        GZ.helpers.track.pageview();
    }

});