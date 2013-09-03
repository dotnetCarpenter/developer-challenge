GZ.Views.MatchScreen = GZ.Views.Screen.extend({

    template: '#template-match-screen',

    className: 'screen',
    tagName: 'div',

    pitchView: null,
    contentArea: null,

    staticViews: {
        prepended: [],
        appended: []
    },

    events: {
        'click .btn-edit': 'onEditTeam'
    },

    ui: {
        pitch: '.pitch',
        pitchEdit: '.pitch-edit'
    },

    regions: {
        pitchArea: '.pitch-container',
        sidebar: '.t3',
        mainContentArea: '.content-area-container'
    },

    initialize: function() {
        this.configureStaticViews();

        this.pitchView = new GZ.Views.Pitch({
            model: this.model
        });

        this.contentArea = new GZ.Views.ContentArea();

        this.playerBioId = this.model.get("captain");

        this.initT3Views();
    },

    initT3Views: function () {
        this.t3ContentArea.views = [];

        if (this.model.isOwnTeam()) {
            this.t3ContentArea.views.push({
                key: 'livefeed',
                view: _.bind(function () {
                    var d = new $.Deferred(),
                        collection = this.model.getLiveFeed(),
                        view = new GZ.Views.LiveFeed({
                            collection: collection
                        });
                        this.listenTo(view, 'show', function () {
                            GZ.app.vent.trigger('sidebar:tabselect:livefeed');
                        });
                    if (collection.length) {
                        collection.fetch( { update:true, merge: true } );
                        d.resolve(view);
                    } else {
                        collection.fetch().done(function () {
                            d.resolve(view);
                        });
                    }
                    return d;
                }, this),
                title: GZ.helpers.i18n.gettext('Live Feed')
            });
        } else {
            this.t3ContentArea.views.push({
                key: 'back_to_my_team',
                view: _.bind(function () {
                    GZ.router.navigate('match/'+GZ.Teams.getCurrent().id, { trigger: true });
                }, this),
                title: GZ.helpers.i18n.gettext('Back to my team')
            });
        }

        this.t3ContentArea.views.push({
            key: 'livescore',
            view: _.bind(function () {
                var d = new $.Deferred(),
                    round = GZ.Leagues.getCurrent().getStatRound();
                round.get("matches").fetch().done(function () {
                    d.resolve(new GZ.Views.LiveScore({
                        round: round
                    }));
                });
                return d;
            }, this),
            title: GZ.helpers.i18n.gettext('Live Score')
        });

        this.t3ContentArea.views.push({
            key: 'managerProfile',
            view: _.bind(function () {
                var d = new $.Deferred(),
                    promises = [],
                    manager, teams;

                if (this.model.isOwnTeam()) {
                    manager = GZ.User;
                    teams = GZ.Teams;
                } else {
                    manager = GZ.Models.User.findOrCreate({ id: this.model.get('user_id') });
                    promises.push(manager.fetch());
                    teams = new GZ.Collections.Teams();
                    teams.user_id = this.model.get('user_id');
                    teams.round_id = GZ.Leagues.getCurrent().getStatRound().id;
                }
                teams.fetch().then(function () {
                    promises = promises.concat(teams.map(function (t) {
                        return t.getGroups().fetch();
                    }));
                    $.when.apply(null, promises).done(function () {
                        d.resolve(new GZ.Views.ManagerProfile({
                            manager: manager,
                            teams: teams
                        }));
                    });
                });
                return d;

            }, this),
            title: GZ.helpers.i18n.gettext('Profile')
        });

        this.t3ContentArea.views.push({
            key: 'playerBio',
            view: _.bind(function () {
                var model;
                model = Backbone.Relational.store.find(GZ.Models.Player, this.playerBioId);
                return new GZ.Views.PlayerBioMatch({
                    model: model,
                    collection: new Backbone.Collection([])
                });
            }, this),
            title: GZ.helpers.i18n.gettext('Bio')
        });


        if (GZ.app.reqres.request('league:status:window:isTransfer')) {
            this.t3ContentArea.startupView = "livescore";
        }

        if (!this.model.isOwnTeam()) {
            this.t3ContentArea.startupView = "managerProfile";
        }

    },

    onEditTeam: function () {
        if (this.model.isEditable()) {
            GZ.router.navigate('team/'+this.model.id, { trigger: true });
        } else {
            alert(GZ.helpers.i18n.gettext("Transfers cannot be made during game window"));
        }
    },

    onRender: function () {
        this.$el.attr('id', 'matchscreen');
        this.updatePitchEditStatus();
    },

    updatePitchEditStatus: function () {
        this.ui.pitchEdit.toggleClass('hide', !this.model.isOwnTeam());
        this.ui.pitchEdit.toggleClass('disabled', !this.model.isEditable());
    },

    gameWindowChanged: function () {
        var team_id = this.model.id;
        this.updatePitchEditStatus();
        GZ.Teams.fetch().then(function () {
            GZ.router.navigate('match/'+team_id, { trigger: true });
        });
    },

    configureStaticViews: function() {
        var globalRankingCollection = new GZ.Collections.Rankings();
        globalRankingCollection.group = "global";
        globalRankingCollection.round = GZ.Leagues.getCurrent().getStatRound().id;
        globalRankingCollection.cachebust = true;
        globalRankingCollection.setComparator('rank', { desc: false });

        this.staticViews.prepended = [
            {
                url: '/match/'+this.model.id,
                view: new GZ.Views.GlobalRankingTableView({
                    model: new Backbone.Model({
                        columns: [
                            { key: 'rank', title: '' },
                            { key: 'name', title: GZ.helpers.i18n.gettext('Name') },
                            { key: 'team_name', title: GZ.helpers.i18n.gettext('Team') },
                            { key: 'score.round_earnings', title: GZ.helpers.i18n.gettext('Round'), formatter: GZ.helpers.ui.toMoney },
                            { key: 'score.earnings', title: GZ.helpers.i18n.gettext('Total'), formatter: GZ.helpers.ui.toMoney }
                        ]
                    }),
                    entireCollection: globalRankingCollection
                }),
                title: GZ.helpers.i18n.gettext('Global')
            }
        ];

        this.staticViews.appended = [
            {
                url: '/match/'+this.model.id+'/group/new',
                view: new GZ.Views.GroupCreate({}),
                title: GZ.helpers.i18n.gettext('Create group'),
                icon: 'plus'
            },
            {
                url: '/match/'+this.model.id+'/group/find',
                view: new GZ.Views.GroupsList({
                    model: new Backbone.Model({ dummy: true }),
                    collection: new GZ.Collections.Groups(null, { league_id: GZ.Leagues.getCurrent().id })
                }),
                title: GZ.helpers.i18n.gettext('Find group'),
                icon: 'search'
            }
        ];
    },

    renderContentArea: function(force) {
        var groupViews;

        if (this.model.isOwnTeam()) {
            groupViews = this.model.getGroups().map(function (groupModel) {
                return {
                    url: '/match/'+this.model.id+'/group/'+groupModel.id,
                    view: new GZ.Views.Group({
                        model: groupModel,
                        collection: new GZ.Collections.GroupRankings([])
                    }),
                    title: groupModel.get('name')
                };
            }, this);

            this.contentArea.setViews(_.union(
                this.staticViews.prepended,
                groupViews,
                this.staticViews.appended
            ));

            this.showViewBasedOnUrl(this.options.url);
        } else {
            this.contentArea.setViews(this.staticViews.prepended);
        }
    },

    showViewBasedOnUrl: function (url) {
        var viewIdx,
            slicedUrl,
            viewOptions;

        if (!_.isUndefined(url)) {
            slicedUrl = url.split('/').slice(3);
            if (slicedUrl[0] == "group") {
                if (slicedUrl[1] == "new") {
                    this.contentArea.showView(this.contentArea.views.length-2);
                } else if (slicedUrl[1] == "find") {
                    this.contentArea.showView(this.contentArea.views.length-1);
                } else {
                    viewOptions = slicedUrl.slice(2);
                    this.contentArea.defaultView = -1;
                    if (!viewOptions.length) {
                        viewOptions = undefined;
                    }
                    this.openGroup(slicedUrl[1], viewOptions);
                }
            }
        }
    },

    addGroup: function(model) {
        this.model.getGroups().add(model);
    },

    removeGroup: function(model) {
        this.model.getGroups().remove(model);
    },

    addGroupView: function(model, collection, info) {
        this.contentArea.addView({
            url: '/match/'+this.model.id+'/group/'+model.id,
            view: new GZ.Views.Group({
                model: model,
                collection: new GZ.Collections.Rankings()
            }),
            title: model.get('name')
        }, -2, true);
    },

    removeGroupView: function(model, collection, info) {
        var viewIndex = info.index + this.staticViews.prepended.length;
        this.contentArea.removeViewAtIndex(viewIndex);
    },

    openGroup: function(group_id, args) {
        var groups = this.model.getGroups(),
            memberGroup = groups.get(group_id),
            groupView = _.find(this.contentArea.views, function (gView) {
                return gView.view.model == memberGroup;
            }),
            model;

        if (memberGroup !== undefined) {
            this.contentArea.showView(groupView.view, args);
            return;
        }
        model = new GZ.Models.Group({ 'id': group_id });
        model.fetch().then(_.bind(function () {
            var groupView = new GZ.Views.Group({
                model: model,
                collection: new GZ.Collections.Rankings()
            });
            this.contentArea.showTemporaryView(groupView, args);
        }, this));

    },

    openGroupsList: function() {
        var view = this.staticViews.appended[1].view;
        this.contentArea.showView(view);
    },

    onTimerHickup: function (timeDiff, lastTick) {
        // If we have had a timer hickup we load missing livefeed items
        if (this.model.isOwnTeam()) {
            this.model.getLiveFeed().loadMissing(new Date().getTime(), lastTick);
        }
    },

    onShow: function () {
        this.listenTo(GZ.app.vent, "showplayer", this.onPitchShowPlayerClick, this);
        this.listenTo(GZ.app.vent, 'group:joined', this.addGroup, this);
        this.listenTo(GZ.app.vent, 'group:left', this.removeGroup, this);
        this.listenTo(GZ.app.vent, 'group:open', this.openGroup, this);
        this.listenTo(GZ.app.vent, 'groups:search', this.openGroupsList, this);
        this.listenTo(GZ.app.vent, 'league:status:window:changed', this.gameWindowChanged, this);
        this.listenTo(GZ.app.vent, 'timer:hickup', this.onTimerHickup, this);

        this.model.subscribe();
        GZ.Leagues.getCurrent().subscribe();
        //GZ.Leagues.getCurrent().getCurrentRound().get('matches').fetch();

        var groups = this.model.getGroups();
        this.listenTo(groups, 'reset', this.renderContentArea, this);
        this.listenTo(groups, 'add', this.addGroupView, this);
        this.listenTo(groups, 'remove', this.removeGroupView, this);
        groups.fetch({ reset: true });

        GZ.app.reqres.setHandler("team:hasPlayer", function (id) {
            return this.model.hasPlayer(id);
        }, this);
        GZ.app.reqres.setHandler("team:isCaptain", function (id) {
            return this.model.get("captain") === id;
        }, this);

        this.sidebar.show(this.t3ContentArea);
        this.pitchArea.show(this.pitchView);
        this.mainContentArea.show(this.contentArea);
    },

    onClose: function () {
        this.stopListening();
        this.model.unsubscribe();
        GZ.Leagues.getCurrent().unsubscribe();

        GZ.app.reqres.removeHandler("team:hasPlayer");
        GZ.app.reqres.removeHandler("team:isCaptain");
    },

    onPitchShowPlayerClick: function(playerId) {
        this.playerBioId = playerId;
        this.t3ContentArea.showView("playerBio");
    }

});