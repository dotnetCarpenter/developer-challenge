GZ.Views.Modals.Announcement = Backbone.View.extend({

    tagName: 'div',
    className: 'announcement',

    initialize: function (options) {
        if (options.announcement) {
            this.announcement = options.announcement;
        }
    },

    render: function () {

        this.$el.html(this.announcement);
    }

});