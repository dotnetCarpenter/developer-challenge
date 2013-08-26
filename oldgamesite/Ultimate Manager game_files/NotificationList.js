GZ.Views.NotificationList = Backbone.Marionette.CompositeView.extend({

    tagName: 'li',
    className: 'dropdown narrow notifications-area',

    template: '#template-notification-list',

    itemView: GZ.Views.NotificationListItem,
    itemViewContainer: 'ul.notifications',
    emptyView: GZ.Views.NotificationListEmpty,

    events: {
        'click .btn-notifications': 'onDropdownOpenClick'
    },

    templateHelpers: function () {
        var obj = {};
        obj.unreadCount = this.collection.unreadCount;
        return obj;
    },

    initialize: function () {
        _.bindAll(this, "onDropdownCloseClick");
        this.listenTo(this.collection, "change:unreadCount", this.render, this);
    },

    onDropdownOpenClick: function () {
        _.defer(_.bind(function () {
            if (this.$el.hasClass('open')) {
                $(document).click(this.onDropdownCloseClick);
            }
        }, this));
    },

    onDropdownCloseClick: function () {
        $(document).off('click', this.onDropdownCloseClick);

        this.collection.clearAllNotifications();
    }

});