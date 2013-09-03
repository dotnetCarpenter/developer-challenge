GZ.Views.PlayerBioMatchStatRow = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'row',
    template: '#template-player-bio-match-stat-row',

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this, arguments),
            points = this.model.get('points');

        data.width = (Math.abs(points) / this.options.maxValue * 50);
        data.barClass = points >= 0 ? 'positive' : 'negative';

        return data;
    }

});

GZ.Views.PlayerBioActionStatsPage = Backbone.Marionette.CollectionView.extend({

    className: 'item',
    itemView: GZ.Views.PlayerBioMatchStatRow,
    initialize: function() {
        this.collection = new Backbone.Collection(this.model.get('rounds'));
        this.itemViewOptions = {
            maxValue: this.model.get('maxValue')
        };
    }

});

GZ.Views.PlayerBioMatch = GZ.Views.PlayerBio.extend({

    tagName: 'div',
    className: 'player-bio match view',
    template: '#template-player-bio-match',

    itemView: GZ.Views.PlayerBioActionStatsPage,
    itemViewContainer: '.section .content .recent-rounds .rows .slider',

    loadingView: GZ.Views.PlayerBioTransferLoading,
    emptyView: GZ.Views.PlayerBioTransferEmpty,

    ui: {
        recentRounds: '.section .content .recent-rounds',
        rowsContainer: '.section .content .recent-rounds .rows-container',
        rows: '.section .content .recent-rounds .rows',
        pagination: '.section .content .recent-rounds .pagination'
    },

    events: {
    },

    modelEvents: {
        "change": "render",
        "change:round_earnings": "updateStatsCollection"
    },

    initialize: function(opts) {
        var roundMatches;

        this.initSubViews();

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
            data.isTeamMember = GZ.app.reqres.request("team:hasPlayer", data.id);
            data.isCaptain = GZ.app.reqres.request("team:isCaptain", data.id);
        }

        return data;
    },

    onShow: function () {
        _.defer(_.bind(this.resetSlider, this));
        this.visible = true;
    },

    onRender: function() {
        this.$('.upcoming-matches').html(this.matchList.render().el);
        this.bindUIElements();
    },

    updateStatsCollection: function() {
        this.entireCollection = new GZ.Collections.PlayerBioBreakdownStats(null, { playerId: this.model.get('id') });
        this.entireCollection.fetch()
            .then(_.bind(function () {
                this.initCollection();
                this.resetSlider();
            }, this));
    }

});