GZ.Views.SimpleContentArea = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    className: 'content-area',

    template: '#template-simple-content-area', //simple-content-area.html
    views: [],

    currentView: -1,
    startupView: undefined,

    regions: {
        viewArea: '.view-area'
    },

    events: {
        'click .navigation-bar li': 'onViewClick'
    },

    ui: {
        'navigationBar': '.navigation-bar'
    },

    templateHelpers: function () {
        return {
            views: _.map(this.views, function (v, idx) {
                return {
                    id: idx,
                    title: v.title
                };
            }, this)
        };
    },

    onViewClick: function (evt) {
        var target = $(evt.currentTarget),
            id = target.data('view-id');
        this.showView(id);
    },

    showView: function(viewIndex) {
        var view, viewPromise;

        // Support view references as well.
        if (!_.isNumber(viewIndex)) {
            if (_.isString(viewIndex)) {
                viewIndex = _.reduce(this.views, function (memo, v, idx) {
                    return (v.key == viewIndex) ? idx : memo; },
                -1);
            } else {
                viewIndex = _.reduce(this.views, function (memo, v, idx) {
                    return (v.view == viewIndex) ? idx : memo; },
                -1);
            }
        }

        view = _.result(this.views[viewIndex], "view");
        if (!_.isUndefined(view)) {
            // We expect view is a promise, if not we'll create one and resolve it immidiately.
            viewPromise = view;
            if (_.isUndefined(viewPromise.promise) && _.isUndefined(viewPromise.done)) {
                viewPromise = new $.Deferred();
                viewPromise.resolve(view);
            }
            if (!viewPromise.isResolved()) {
                this.$el.addClass('loading');
            }
            this.currentView = viewIndex;
            this.highlightActiveTab();
            viewPromise.done(_.bind(function (view) {
                // If user changed view we're gonna close the view and
                // carry on like nothing happened.
                if (this.currentView != viewIndex) {
                    view.close();
                    return;
                }
                this.$el.removeClass('loading');
                this.viewArea.show(view);
            }, this));
        }
        return view;
    },

    onShow: function () {
        if (!_.isUndefined(this.startupView)) {
            this.showView(this.startupView);
        } else {
            this.showView(0);
        }
    },

    highlightActiveTab: function () {
        this.ui.navigationBar.find('li').removeClass('active');
        this.ui.navigationBar.find('li[data-view-id='+this.currentView+']').addClass('active');
    }

});