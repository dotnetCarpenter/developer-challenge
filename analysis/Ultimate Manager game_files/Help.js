GZ.Views.Modals.Help = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    template: '#template-modals-help',

    events: {
        'click .navigation-bar': 'navigate'
    },

    initialize: function() {
        _.bindAll(this);
        this.$el.css('height', '100%');
        this.render();
    },


    navigate: function (evt) {
        var $navItem = $(evt.target),
            $tabContent = this.$('#'+$navItem.data('tab'));

        this.$('.navigation-bar .active').removeClass('active');
        this.$('.tabbed-content .active').removeClass('active');

        this.$('.tabbed-content')[0].scrollTop = 0;

        $navItem.addClass('active');
        $tabContent.addClass('active');
    }


});