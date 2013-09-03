GZ.Views.PlanCreditCardOverview = Backbone.Marionette.Layout.extend(
    _.extend({}, GZ.Mixins.TypingValidation, {

    tagName: 'div',
    template: '#template-plan-credit-card-overview',

    regions: {
        couponArea: '.coupon-area',
        creditCardArea: '.credit-card-area'
    },

    events: {
        'click .action-finish': 'finish'
    },

    templateHelpers: function () {
        return {
            plan: this.options.plan.toJSON(),
            isCouponActive: this.options.coupon.isRedeemable(),
            couponMonths: this.options.coupon.get('amount'),
            planOptions: {
                'basic': {
                    'leagues': '1',
                    'teams': '1'
                },
                'extra': {
                    'leagues': '1',
                    'teams': '3'
                },
                'ultimate': {
                    'leagues': GZ.helpers.i18n.gettext('Unlimited'),
                    'teams': GZ.helpers.i18n.gettext('Unlimited')
                }
            }
        };
    },

    onShow: function () {
        var coupon = this.options.coupon,
            showCreditCard = true;
        if (!_.isUndefined(coupon) && coupon.isRedeemable()) {
            this.couponArea.show(new GZ.Views.RedeemCoupon({
                displayOnly: true,
                showVertically: true,
                model: this.options.coupon
            }));
            showCreditCard = coupon.requiresCreditcard();
        }
        if (showCreditCard) {
            this.creditCardArea.show(new GZ.Views.CreditCard({
                model: this.options.creditCard,
                btnText: GZ.helpers.i18n.gettext("Finish setup")
            }));
            this.listenTo(this.options.creditCard, 'transaction:done', this.finish, this);
        } else {
            this.$('.action-finish').removeClass('hide');
        }
    },

    finish: function () {
        GZ.User.fetch();
        this.trigger("creditcard:saved");
    }


}));