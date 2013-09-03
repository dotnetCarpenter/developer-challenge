GZ.Views.TransferBalance = Backbone.View.extend({

    initialize: function(options) {
        if (options.balance) this.setBalance(options.balance);
    },

    setBalance: function(balance) {
        var negative = balance < 0,
            formattedBalance = GZ.helpers.ui.toMoney(Math.abs(balance));

        this.$el.toggleClass('negative', negative);
        this.$('.value').html(formattedBalance);
    }

});