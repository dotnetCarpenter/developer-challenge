GZ.Views.AccountPlansOverview = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    className: '',
    template: '#template-account-plans-overview',

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
        var validPackages, v;
        if (GZ.User.get("paymentplans").length > 0 && !_.isUndefined(GZ.User.get("paymentplans").getActive())) {
            validPackages = GZ.User.get("paymentplans").getActive().getUpgradePlans();
        }
        v = new GZ.Views.PlansOverview({
            hideTrialBanner: true,
            validPackages: validPackages,
            extraInfo: GZ.helpers.i18n.gettext("At the moment it is not possible to downgrade plans. Please contact support if you would like to do so.")
        });
        this.listenTo(v, 'plan:selected', function (plan, coupon) {
            GZ.User.fetch().then(_.bind(function () {
                this.trigger('plan:selected', plan, coupon);
            }, this));
        }, this);
        this.mainArea.show(v);
    }

});