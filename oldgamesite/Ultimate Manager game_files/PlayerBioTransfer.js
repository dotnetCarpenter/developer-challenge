GZ.Views.PlayerBioRoundStatsPage = Backbone.Marionette.CollectionView.extend({

    className: 'item',
    itemView: GZ.Views.PlayerBioTransferStatRow,
    initialize: function(options) {
        this.collection = new Backbone.Collection(this.model.get('rounds'));
        this.itemViewOptions = { thirdStat: options.thirdStat };
    }

});

GZ.Views.PlayerBioTransfer = GZ.Views.PlayerBio.extend({

    tagName: 'div',
    className: 'player-bio transfer view',
    template: '#template-player-bio-transfer',

    itemView: GZ.Views.PlayerBioRoundStatsPage,
    itemViewContainer: '.section .content .recent-rounds .rows .slider',
    itemViewOptions: function() {
        var key = 'clean_sheet',
            bool = true;

        if (this.model.get('position') === 'Forward') {
            key = 'shot_on_target';
            bool = false;
        }
        return {
            thirdStat: {
                key: key,
                bool: bool
            }
        };
    },

    loadingView: GZ.Views.PlayerBioTransferLoading,
    emptyView: GZ.Views.PlayerBioTransferEmpty,

    ui: {
        captainCheckbox: '.action input[name=captain]',
        recentRounds: '.section .content .recent-rounds',
        rowsContainer: '.section .content .recent-rounds .rows-container',
        rows: '.section .content .recent-rounds .rows',
        pagination: '.section .content .recent-rounds .pagination'
    },

    events: {
        'click .action .captain': 'setCaptain',
        'click .action .add': 'buyPlayer',
        'click .action .remove': 'sellPlayer'
    },

    initialize: function(opts) {
        this.initSubViews();

        this.listenTo(GZ.app.vent, "transfers:setcaptain", this.captainChanged, this);
        this.listenTo(GZ.app.vent, "transfers:buyplayer", this.playerBoughtOrSold, this);
        this.listenTo(GZ.app.vent, "transfers:sellplayer", this.playerBoughtOrSold, this);
        this.listenTo(this.pagination, 'change:limit', this.initCollection, this);
        this.listenTo(this.pagination, 'change:active', this.activeSlideChanged, this);

        if (!_.isUndefined(this.model) && !_.isNull(this.model)) {
            roundMatches = GZ.helpers.squad.findRoundMatches(GZ.helpers.squad.getForPlayer(this.model.get('id')));
            this.matchList.update(roundMatches, GZ.helpers.ui.playerSquad(this.model.get('id')));
            this.updateStatsCollection();
        }
    },

    serializeData: function() {
        var data = GZ.Views.PlayerBio.prototype.serializeData.apply(this, arguments);

        if (data.id) {
            var key = 'clean_sheet';
            if (data.position === 'Forward') {
                key = 'shot_on_target';
            }
            data.thirdStat = GZ.helpers.ui.getReadableActionName(key);
            data.isTeamMember = GZ.app.reqres.request("team:hasPlayer", data.id);
            data.isCaptain = GZ.app.reqres.request("team:isCaptain", data.id);
        }

        return data;
    },

    onRender: function() {
        this.$('.upcoming-matches .content').html(this.matchList.render().el);
        this.calculatePaginationLimit();
        this.updatePagination();
        this.rendered = true;
        this.delegateEvents();
    },

    updateStatsCollection: function() {
        this.entireCollection = new GZ.Collections.PlayerBioRoundStats(null, { playerId: this.model.get('id') });
        this.entireCollection.fetch()
            .then(_.bind(function () {
                this.initCollection();
                this.resetSlider();
            }, this));
    },

    captainChanged: function(playerId) {
        _.defer(this.render);
    },

    playerBoughtOrSold: function(playerId) {
        if (this.model.get('id') == playerId) {
            _.defer(this.render);
            return;
        }
    },

    showTransfersError: function () {
        if (GZ.app.reqres.request("team:canTransfer")) {
            return !!alert(GZ.helpers.i18n.gettext("Transfers cannot be made during game window"));
        }
        return true;
    },

    buyPlayer: function() {
        if (!this.showTransfersError()) return;
        GZ.app.vent.trigger("transfers:buyplayer", this.model.get("id"));
    },

    sellPlayer: function() {
        if (!this.showTransfersError()) return;
        GZ.app.vent.trigger("transfers:sellplayer", this.model.get("id"));
    },

    setCaptain: function() {
        if (!this.showTransfersError()) return;
        GZ.app.vent.trigger("transfers:setcaptain", this.model.get("id"));
    }

});