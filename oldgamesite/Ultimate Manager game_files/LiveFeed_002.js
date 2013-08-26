GZ.Views.LiveFeed = Backbone.Marionette.CompositeView.extend({

    template: '#template-livefeed',
    itemView: GZ.Views.LiveFeedItem,

    events: {
        "click .loadmore": "loadMore"
    },

    ui: {
        loadMore: '.loadmore'
    },

    maxBackendItem: 25,

    loadMoreEnabled: true,

    onShow: function(){
        this.subscribeUpdates();
        if (this.customScrollOn) return;
        this.customScrollOn = true;
        this.setupCustomScroll();
    },

    onClose: function () {
        this.unsubscribeUpdates();
    },

    subscribeUpdates: function () {
        if (this.collection) {
            this.collection.subscribe();
        }
    },

    unsubscribeUpdates: function () {
        if (this.collection) {
            this.collection.unsubscribe();
        }
    },

    onRender: function () {
        this.$el.attr('id', 'livefeed');
        if (this.collection.length > this.maxBackendItem) {
            this.$('.loadmore').show();
        }

        if (this.customScrollOn) {
            this.setupCustomScroll();
        }
    },

    showEmptyView: function () {
        this.$('.loadmore').hide();
        this.$('.empty-text').removeClass('hide');
    },

    closeEmptyView: function () {
        if (this.collection.length > this.maxBackendItem) {
            this.$('.loadmore').show();
        }
        this.$('.empty-text').addClass('hide');
    },

    setupCustomScroll: function () {
        this.$el.customScroll({
            bottomZoneHeight: 100,
            onBottomReached: _.debounce(_.bind(function (bottomDistance) {
                if (this.collection.length) {
                    this.loadMore();
                }
            }, this), 300, true)
        });
    },

    appendHtml: function(collectionView, itemView) {
        var index = collectionView.collection.indexOf(itemView.model),
            action,
            container = this.$('.feed-list');

        if (index <= 0) action = 'prepend';
        else if (index > container.children().length - 1) action = 'append';

        if (action) container[action](itemView.$el.hide().fadeIn('slow'));
        else container.children().eq(index - 1).after(itemView.$el.hide().fadeIn('slow'));

        if ( !itemView.model.get("historic") ) {
            var scrollTop = container.scrollTop();
            if (scrollTop > 0) {
                container.scrollTop(scrollTop + itemView.$el.height());
            }
        }
    },

    loadMore: function(event) {
        if (this.loadMoreEnabled) {
            if (!this.$('.loadmore').hasClass('loading')) {
                this.$('.loadmore').addClass('loading');
                this.collection.loadMore()
                    .then(_.bind(function (items) {
                        this.$('.loadmore').removeClass('loading');
                        if (items.response.length < this.maxBackendItem) {
                            this.loadMoreEnabled = false;
                            this.$('.loadmore').hide();
                        }
                    }, this));
            }
        }
    }

});