(function(superView){

    GZ.Views.PlayerBio = superView.extend(_.extend(GZ.Mixins.LoadingView, {

        pagination: undefined,

        rendered: false,
        visible: false,

        // Override default constructor to manipulate collection for pagination
        constructor: function(opts) {
            opts.collection = new Backbone.Collection([]);
            this.pagination = new Backbone.Model({
                limit: 10,
                count: 1,
                active: 1
            });
            superView.prototype.constructor.call(this, opts);
            _.bindAll(this, "updateActiveSlide");
        },

        initSubViews: function() {
            this.matchList = new GZ.Views.PlayerBioMatchList({
                collection: new GZ.Collections.SortedMatches([])
            });
        },

        onShow: function() {
            if (this.rendered && this.visible) return;
            this.visible = true;
        },

        onClose: function() {
            this.visible = false;
        },

        onRender: function() {
            this.rendered = true;
        },

        onCollectionRendered: function() {
            if (this.visible) _.defer(_.bind(this.initSlider, this));
        },

        calculatePaginationLimit: function() {
            var totalHeight = this.$el.height() + this.$el.offset().top,
                paginationHeight = 32,
                rowHeight = 28,
                listOffset = this.getItemViewContainer(this).offset().top,
                availableHeight = totalHeight - listOffset - paginationHeight,
                rowLimit = Math.floor(availableHeight / rowHeight);

            if (rowLimit>0) {
                this.pagination.set('limit', rowLimit);
            }
        },

        initSlider: function() {
            this.ensureRowsContainerPosition();
            this.ui.rows.iosSlider('destroy');
            this.ui.rows.iosSlider({
                snapToChildren: true,
                desktopClickDrag: true,
                navSlideSelector: this.ui.pagination.find('li.index'),
                navPrevSelector: this.ui.pagination.find('li.prev'),
                navNextSelector: this.ui.pagination.find('li.next'),
                onSlideStart: this.updateActiveSlide,
                onSlideComplete: this.updateActiveSlide
            });
        },

        ensureRowsContainerPosition: function() {
            var rowsContainerOffset = this.ui.recentRounds.offset().top + this.ui.recentRounds.height(),
                deltaOffset = this.$el.offset().top;
            this.ui.rowsContainer.css('top', (rowsContainerOffset - deltaOffset) + 'px');
        },

        updateSlider: function() {
            this.ui.rows.iosSlider('update');
        },

        initCollection: function() {
            this.isLoading = false;

            var newCollection = [],
                pageCount = Math.ceil(this.entireCollection.length / this.pagination.get('limit'));

            this.pagination.set('count', pageCount);

            for (var n = 0, offset; n < pageCount; n++) {
                offset = n * this.pagination.get('limit');

                newCollection.push({
                    rounds: this.entireCollection.slice(offset, offset+this.pagination.get('limit')),
                    maxValue: this.entireCollection.getMaxValue()
                });
            }
            this.collection.reset(newCollection);
        },

        resetSlider: function () {
            this.calculatePaginationLimit();
            this.updatePagination();
            this.initSlider();
        },

        updatePagination: function() {
            if (this.pagination.get('count') <= 1) {
                return this.ui.pagination.hide();
            }

            this.ui.pagination.show().find('li.index').slice(1).remove();
            var $items = this.ui.pagination.find('li.index'),
                $keyItem = $items.slice(0, 1).removeClass('active');

            $items.slice(1).remove();

            for (var n = 1; n < this.pagination.get('count'); n++) {
                $keyItem.clone(true).insertAfter($keyItem);
            }

            $keyItem.addClass('active');
        },

        updateActiveSlide: function(args) {
            this.pagination.set('active', args.targetSlideNumber);
        },

        activeSlideChanged: function() {
            this.ui
                .pagination
                .find('li.index')
                .removeClass('active')
                .eq(this.pagination.get('active')-1)
                .addClass('active');
        }

    }));

})(Backbone.Marionette.CompositeView);