GZ.Views.AccountCreditCard = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    className: 'row',
    template: '#template-account-credit-card',

    regions: {
        mainArea: '.main-area'
    },

    events: {
        'click .action-back': 'onActionBack'
    },

    onActionBack: function () {
        this.trigger('back');
    },

    onShow: function () {
        var v = new GZ.Views.CreditCard({
            model: this.model,
            btnText: GZ.helpers.i18n.gettext("Save creditcard")
        });
        this.mainArea.show(v);
    }

});