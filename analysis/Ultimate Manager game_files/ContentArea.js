/*
* Super-View to handle tabbed content
* After instantiation, call setViews w/ array of object with these props:
* - view (View) instance, which will be appended to the ContentArea el
* - title (string) Used for the navigation bar
* - icon (string, optional) Prepended to title. FontAwesome class w/o "icon-"
*/

GZ.Views.ContentArea = Backbone.View.extend({

    tagName: 'div',
    className: 'content-area',
    navigationBar: null,
    defaultView: 0,
    activeView: -2, // -2: no active view, -1: temporary view, index value
    views: [],
    temporaryView: null,

    setViews: function(views, showView) {
        showView = _.isUndefined(showView) ? true : !!showView;
        this.hideActiveView();

        this.views = views;

        this.$el.empty();
        _.each(views, function (v) {
            v.view.$el.addClass('view').hide();
            this.$el.append(v.view.el);
        }, this);

        this.initNavigation();

        if (showView) {
            if (this.activeView < 0) {
                this.showView(this.defaultView);
            } else {
                this.showView(this.activeView);
            }
        }
    },

    addView: function(viewOptions, offset, setActive) {
        if (offset === undefined) {
            this.views.push(viewOptions);
        } else {
            var realOffset = offset < 0 ? (this.views.length - 1) + offset : offset;
            if (realOffset <= this.activeView) {
                this.activeView++;
            }
            this.views.splice(offset, 0, viewOptions);
        }

        this.$el.append(
            viewOptions.view.$el.addClass('view').hide()
        );

        this.initNavigation();

        if (setActive === true) {
            offset = offset || this.views.length - 1;
            if (offset < 0) offset = this.views.length + (-1 + offset);
            this.showView(offset);
        }
    },

    removeViewAtIndex: function(viewIndex) {
        var viewOptions = this.views[viewIndex];

        this.views.splice(viewIndex, 1);
        this.showTemporaryView(viewOptions.view);
        this.initNavigation();
    },

    initNavigation: function() {
        if (this.navigationBar) {
            this.navigationBar.close();
        }

        this.navigationBar = new GZ.Views.NavigationBar({
            model: new Backbone.Model({
                "views": this.views
            })
        });
        this.navigationBar.on('navigate', this.navigate, this);
        this.$el.append(this.navigationBar.el);
        this.showView(this.activeView);
    },

    navigate: function(index) {
        this.showView(index);
    },

    hideActiveView: function() {
        if (this.activeView > -1) {
            var view = this.views[this.activeView].view;
            view.$el.hide();
            view.trigger('hid');
            // this.activeView = -2;
            return;
        }
        this.destroyTemporaryView();
    },

    showView: function(viewIndex, args) {
        // Support view references as well.
        if (!_.isNumber(viewIndex)) {
            viewIndex = _.reduce(this.views, function (memo, v, idx) {
                return (v.view == viewIndex) ? idx : memo; },
            -1);
        }
        if (this.views.length < viewIndex || viewIndex < 0) return;

        var view = this.views[viewIndex].view;

        this.hideActiveView();

        view.trigger('shown', args);
        view.$el.show();

        this.navigationBar.setActive(viewIndex);
        this.activeView = viewIndex;

        if (!_.isUndefined(this.views[viewIndex].url)) {
            GZ.router.navigate(this.views[viewIndex].url, { trigger: false });
        }
    },

    // Show a view that is and should not be included in the navigation
    showTemporaryView: function(view, args) {
        this.$el.append(
            view.$el.addClass('view')
        );

        this.hideActiveView();

        view.trigger('shown', args);
        view.$el.show();

        this.temporaryView = view;
        this.navigationBar.setActive(-1);
        this.activeView = -1;
    },

    destroyTemporaryView: function() {
        if (!this.temporaryView) return;
        this.temporaryView.trigger('hid');
        this.temporaryView.close();
    },

    close: function () {
        // This is not a marionette view, so we'll have to define a
        // close method instead of relying on the default onClose logic
        this.hideActiveView();
    }

});