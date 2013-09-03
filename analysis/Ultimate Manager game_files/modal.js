GZ.Views.Modal = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'modal-container',
    template: '#template-modal',
    viewContainer: '.content',
    currentView: null,

    ui: {
        closeButton: 'a[href="#close"]',
        window: '.modal-window'
    },

    events: {
        'click .modal-bg': 'handleUserClose',
        'click a[href="#close"]': 'handleUserClose'
    },

    defaultViewOptions: {
        className: null,
        close: true,
        size: {
            width: 830, height: 534
        }
    },

    initialize: function() {
        this.render();
        this.$el.hide();
    },

    showView: function(view, viewOptions) {
        this.reset();

        this.viewOptions = _.extend({}, this.defaultViewOptions, viewOptions);
        if (this.viewOptions.close === false) {
            this.ui.closeButton.hide();
        }
        if (this.viewOptions.className) {
            this.$el.addClass(this.viewOptions.className);
        }

        view.render();

        this.currentView = view;
        this.$(this.viewContainer).html(view.el);

        if (!_.isUndefined(this.viewOptions.size)) {
            this.resize(this.viewOptions.size.width,
                        this.viewOptions.size.height);
        }

        this.$el.fadeIn('fast');

        Marionette.triggerMethod.call(view, "show");
    },

    reset: function() {
        var self = this;

        if (this.viewOptions) {
            if (this.viewOptions.className) {
                this.$el.removeClass(this.viewOptions.className);
            }
        }

        this.viewOptions = {};
        this.ui.closeButton.show();

        this.$(this.viewContainer).empty();
        if (this.currentView && this.currentView.close) {
            this.currentView.close();
        }
    },

    handleUserClose: function (evt) {
        if (evt) evt.preventDefault();
        if (this.viewOptions.close === false) return;
        this.resetAndClose();
    },

    resetAndClose: function() {
        this.reset();
        this.$el.hide();
    },

    resize: function (width, height) {
        this.ui.window.css({
            'width': width,
            'height': height,
            'margin-left': -width / 2,
            'margin-top': -height / 2
        });
    }

});