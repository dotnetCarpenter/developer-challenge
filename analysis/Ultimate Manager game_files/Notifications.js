GZ.Collections.Notifications = GZ.Collection.extend({

    model: GZ.Models.Notification,

    url: GZ.Backend + "/notifications",

    unreadCount: 0,

    initialize: function () {
        _.bindAll(this, "loopFetch");

        this.listenTo(this, "add reset remove change:is_read", this.updateUnreadCount, this);

        this.loopFetch();
    },

    loopFetch: function () {
        this.fetch();
        _.delay(this.loopFetch, 30000); // Fetch every 30 second
    },

    updateUnreadCount: function () {
        var count = this.where({is_read: false}).length;
        if (this.unreadCount != count) {
            this.unreadCount = count;
            this.trigger('change:unreadCount', count);
        }
    },

    comparator: function (model) {
        return -parseInt(model.get('created_at'), 10);
    },

    clearAllNotifications: function () {
        this.forEach(function (model) {
            if (!model.get('is_read')) {
                model.set('is_read', true);
                model.save();
            }
        });
    }

});