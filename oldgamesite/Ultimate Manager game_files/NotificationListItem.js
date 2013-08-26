GZ.Views.NotificationListItem = Backbone.Marionette.ItemView.extend({

    tagName: 'li',
    template: '#template-notification-list-item',
    className: 'notification',

    events: {
        'click a': 'onClick'
    },

    templateHelpers: function () {
        var url = this.model.get('url');
        if (url.match(/\/match\/group\/(\d+)/)) {
            url = url.replace("/match/group", "/match/"+GZ.Teams.getCurrent().id+"/group");
        }
        return {
            url: url
        };
    },

    onRender: function () {
        this.$('a').toggleClass('unread', !this.model.get('is_read'));
    },

    onClick: function (evt) {
        var $link = $(evt.currentTarget),
            route = $link.attr('href').replace(/^\//, "");

        if ( route.indexOf('http') !== 0 && !this.model.get('no_catch') ) {
            evt.preventDefault();
            GZ.router.navigate(route, { trigger: true });
        }
    }

});