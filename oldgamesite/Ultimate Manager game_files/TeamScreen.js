GZ.Views.TeamScreen = GZ.Views.Screen.extend({

	template: "#template-team-screen",

    className: 'screen',
    tagName: 'div',

    events: {
        'click button.save-team': 'saveTeam',
        'click button.reset-team': 'resetTeam'
    },

    regions: {
        pitchArea: '.pitch-container',
        sidebar: '.t3',
        formationPickerArea: '.formationpicker-container'
    },

    ui: {
        saveTeamButton: 'button.save-team',
        resetTeamButton: 'button.reset-team'
    },

    modelEvents: {
        'change': 'renderButtonState'
    },

    t3data: {
        playerBio: undefined
    },

	initialize: function(opt) {
        _.bindAll(this, "renderButtonState");

        this.pitchView = new GZ.Views.Pitch({
            model: this.model
        });

        this.formationPicker = new GZ.Views.FormationPicker({
            model: this.model
        });

        this.setT3Data("playerBio", this.model.get('captain') || GZ.Leagues.getCurrent().get('squads').getHighestValuedPlayer());

        this.t3ContentArea.views = [
            {
                view: _.bind(function () {
                    return new GZ.Views.Fixtures({
                        collection: GZ.Leagues.getCurrent().get("rounds")
                    });
                }, this),
                title: GZ.helpers.i18n.gettext('Fixtures')
            },
            {
                view: _.bind(function () {
                    model = Backbone.Relational.store.find(GZ.Models.Player, this.t3data.playerBio);
                    return new GZ.Views.PlayerBioTransfer({
                        model: model,
                        collection: new Backbone.Collection([])
                    });
                }, this),
                title: GZ.helpers.i18n.gettext('Bio')
            }
        ];


    },

    setPitchHoverMenuSettings: function () {
        if (this.model.isEditable()) {
            this.pitchView.hoverMenu = {
                captain: true,
                info: true,
                sell: true
            };
        } else {
            this.pitchView.hoverMenu = {
                captain: false,
                info: true,
                sell: false
            };
        }
    },

    onBeforeRender: function () {
        this.setPitchHoverMenuSettings();
    },

    onRender: function () {
        this.$el.attr('id', 'teamscreen');

        this.renderButtonState();

        this.squadSelectorView = new GZ.Views.SquadSelector({
            el: this.$("#squadselector"),
            collection: GZ.Leagues.getCurrent().get('squads'),
            model: this.model
        });

        this.squadPlayersView = new GZ.Views.SquadPlayers({
            el: this.$("#squadlist"),
            collection: GZ.Leagues.getCurrent().get('squads'),
            transferDisabled: !this.model.isEditable()
        });

    },

    renderButtonState: function () {
        this.ui.saveTeamButton.toggleClass('disabled', !this.model.hasChanged());
    },

    saveTeam: function () {
        var error;
        if (!this.model.hasChanged()) {
            this.renderButtonState();
            return;
        }

        if (GZ.app.reqres.request("league:status:window:isMatch") && GZ.app.reqres.request("league:round:isLast")) {
            alert(GZ.helpers.i18n.gettext('The league is in the last round. You cannot set up a team.'));
            return;
        }
        if (!GZ.app.reqres.request("league:status:window:isMatch") && !GZ.app.reqres.request("league:status:window:isTransfer")) {
            alert(GZ.helpers.i18n.gettext('The league is over. You cannot set up a team.'));
            return;
        }

        error = this.model.validateTeam();
        if (error) {
            alert(error);
            return;
        }

        if (this.model.isNew()) {
            var saveModal = new GZ.Views.Modals.TeamSave({ user: GZ.User, team: this.model });
            this.listenTo(saveModal, 'save', this.finishSaveTeam, this);
            GZ.helpers.modal.open(saveModal);
        } else {
            // Save regular team!

            this.model.save(null, {wait:true})
                .then(_.bind(this.finishSaveTeam, this));
        }
    },

    finishSaveTeam: function () {
        var hash = Backbone.history.getHash(),
            group;

        GZ.Teams.fetch().then(_.bind(function () {
            GZ.app.reqres.removeHandler("router:canNavigate");
            GZ.router.navigate("match/"+this.model.id, { trigger: true, replace: true});
        }, this));
        GZ.helpers.modal.close();

        if (hash.length) {
            queryMap = this.queryStringMap(hash);
            if ( !_.isUndefined(queryMap.join_group) ) {
                group = new GZ.Models.Group({id: queryMap.join_group});
                group.join(this.model.id);
            }
        }
    },

    queryStringMap: function (str) {
        var queryStrings,
            map = {};

        queryStrings = str.split(/[\&\=]/);
        for (var i=0; i<queryStrings.length; i+=2) {
            map[queryStrings[i]] = queryStrings[i+1];
        }
        return map;
    },

    resetTeam: function () {
        var res = this.model.reset();
        if (this.model.isNew()) {
            res.then(this.renderButtonState);
        } else {
            GZ.app.reqres.removeHandler("router:canNavigate");
            GZ.router.navigate("match/"+this.model.id, { trigger: true });
        }
    },

    buyPlayer: function(id) {
        var player = Backbone.Relational.store.find(GZ.Models.Player, id),
            canAddPlayer = false;

        if (!_.isUndefined(player)) {
            canAddPlayer = this.model.canPlayerBeAdded(player);
        }

        if (canAddPlayer === true) {
            this.model.addPlayer(player);
            GZ.app.vent.trigger('transfers:playerBought', player);
        } else {
            alert(canAddPlayer);
        }
    },

    sellPlayer: function(id) {
        var player = this.model.get("players").get(id);
        this.model.removePlayer(player);
    },

    setCaptain: function (id) {
        this.model.setCaptain(id);
    },

    onShow: function () {
        this.listenTo(GZ.app.vent, 'transfers:buyplayer', this.buyPlayer, this);
        this.listenTo(GZ.app.vent, 'transfers:sellplayer', this.sellPlayer, this);
        this.listenTo(GZ.app.vent, 'transfers:setcaptain', this.setCaptain, this);
        this.listenTo(GZ.app.vent, "showplayer", this.onPitchShowPlayerClick, this);


        GZ.app.reqres.setHandler("team:hasCaptain", this.model.hasCaptain, this.model);
        GZ.app.reqres.setHandler("team:isValid", this.model.isPlayersValid, this.model);
        GZ.app.reqres.setHandler("team:isFull", this.model.isFull, this.model);
        GZ.app.reqres.setHandler("team:hasPlayer", this.model.hasPlayer, this.model);
        GZ.app.reqres.setHandler("team:isCaptain", this.model.isCaptain, this.model);
        GZ.app.reqres.setHandler("team:canTransfer", function () {
            return GZ.app.reqres.request("league:status:window:isMatch") && !this.model.isNew();
        }, this);

        GZ.app.reqres.setHandler("router:canNavigate", function () {
            if (this.model.hasChanged() || this.model.isNew()) {
                return GZ.helpers.i18n.gettext('Your team has not been saved yet, would you really like to navigate away (loosing all changes)?');
            }
            return false;
        }, this);

        this.pitchArea.show(this.pitchView);
        this.formationPickerArea.show(this.formationPicker);
        this.sidebar.show(this.t3ContentArea);
        this.squadPlayersView.$el.show();
        this.squadSelectorView.$el.show();
    },

    onClose: function () {
        this.stopListening();

        GZ.app.reqres.removeHandler("team:isFull");
        GZ.app.reqres.removeHandler("team:hasPlayer");
        GZ.app.reqres.removeHandler("team:isCaptain");
        GZ.app.reqres.removeHandler("team:canTransfer");
        GZ.app.reqres.removeHandler("router:canNavigate");
    },

    onPitchShowPlayerClick: function(playerId) {
        this.setT3Data("playerBio", playerId);
        this.t3ContentArea.showView(1);
    }

});

