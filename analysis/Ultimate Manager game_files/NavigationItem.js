GZ.Model.NavigationItem = Backbone.Model.extend({

    canFetch: function() {
        return !!this.get('context_menu_feed_url');
    },

    fetch: function() {
        if (!this.get('context_menu_feed_url')) return this;

        $.get(this.get('context_menu_feed_url'), _.bind(function(data){
            if (data.status != 'ok') return;

            var unread_items = 0,
                i = 0,
                n = data.response.length;

            for (; i < n; i++) {
                if (data.response[i].is_read) continue;

                // The vent property is used to trigger an event through GZ.app.vent for the possibility of reacting to certain notifications.
                if (data.response[i].event) {
                    var event = data.response[i].event.split(':'),
                        type = 'notification:' + event.shift();

                    GZ.app.vent.trigger(type, event);
                }
                unread_items++;
            }

            this.set({
                "context_menu": data.response,
                "badge_count":  unread_items
            });
        }, this), 'json');
    },

    markContextMenuItemsRead: function() {
        if (!this.get('context_menu_feed_url')) return this;

        this.set('badge_count', 0);
        var unread_items = _.filter(this.get('context_menu'), function(it) {
            return !it.is_read;
        });
        var deferreds = _.map(unread_items, function (it) {
            return $.ajax({
                type: 'PUT',
                url: this.get('context_menu_feed_url')+'/'+it.id
            });
        }, this);
        $.when.apply($, deferreds).then(_.bind(function () {
            this.fetch();
        }, this));
    }

});