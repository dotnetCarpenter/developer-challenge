GZ.Views.GlobalRankingTableRow = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',
    template: '#global-ranking-row-template',
    events: {
        'click': 'showManager'
    },

    initialize: function(options) {
        this.model.set('columns', options.columns);
    },

    showManager: function() {
        GZ.app.vent.trigger("app:showTeam", this.model.get('team_id'));
    },

    onRender: function() {
        this.$el.toggleClass('current-user', this.model.get('isCurrentUser'));
    }

});

GZ.Views.GlobalRankingPaginationItem = Backbone.Marionette.ItemView.extend({

    tagName: 'li',
    template: '#global-ranking-pagination-template',
    events: {
        'click a[href="#page"]': 'bubbleClick'
    },

    bubbleClick: function(e) {
        e.preventDefault();
        this.trigger('selected');
    }

});

GZ.Views.GlobalRankingPagination = Backbone.Marionette.CollectionView.extend({

    tagName: 'ul',
    className: 'pagination',
    itemView: GZ.Views.GlobalRankingPaginationItem,

    initialize: function() {
        this.on('itemview:selected', this.changePage, this);
    },

    changePage: function(e) {
        this.trigger('changePage', e.model.get('page'));
    }

});

GZ.Views.GlobalRankingTableView = GZ.Views.PaginatedTableView.extend({

    tagName: 'div',
    className: 'global-ranking',

    template: '#global-ranking-template',

    itemView: GZ.Views.GlobalRankingTableRow,
    itemViewContainer: 'tbody',
    paginationView: GZ.Views.GlobalRankingPagination,

    autoUpdate: false,

    initialize: function() {
        this.on('shown', this.viewShown, this);
        this.on('hid', this.viewHid, this);
    },

    viewShown: function() {
        this.pageLimit = Math.floor((this.$el.height() - 30) / 22) - 1;

        this.entireCollection.fetch().then(_.bind(function () {
            this.updateCollection();
        }, this));
        this.render();

        this.autoUpdateRankings();
    },

    viewHid: function() {
        this.stopAutoUpdate();
    },

    autoUpdateRankings: function() {
        this.autoUpdate = true;
        // Update global ranking every 30 sec
        _.delay(_.bind(this.fetchRankings, this), 30000);
    },

    stopAutoUpdate: function() {
        this.autoUpdate = false;
    },

    fetchRankings: function() {
        this.entireCollection.fetch();
        if (this.autoUpdate) this.autoUpdateRankings();
    }

});