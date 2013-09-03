GZ.Views.RedeemCoupon = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'form-horizontal',
    template: '#template-redeem-coupon',

    events: {
        'keyup #coupon-code': 'onKeyupCouponCode',
        'click .redeem-coupon': 'onClickRedeem',
        'click .cancel': 'onClickCancel'
    },

    initialize: function () {
        if (!!this.options.showVertically) {
            this.className = '';
            if (!_.isUndefined(this.$el)) {
                this.$el.removeClass('form-horizontal');
            }
        }
    },

    templateHelpers: function () {
        return {
            displayOnly: !!this.options.displayOnly,
            isRedeemable: this.model.isRedeemable()
        };
    },

    onFocus: function () {
        this.$('#coupon-code').focus();
    },

    onKeyupCouponCode: function (evt) {
        if (evt.keyCode == 13) {
            this.$('.redeem-coupon').trigger('click');
        }
    },

    onClickRedeem: function () {
        var code = this.$('#coupon-code').val();
        this.model.set('uuid', code);
        this.model.fetch()
            .fail(_.bind(function () {
                Marionette.triggerMethod.call(this, "coupon:invalid", "Coupon is not valid. Did you type it in correctly?");
            }, this))
            .done(_.bind(function () {
                Marionette.triggerMethod.call(this, 'coupon:valid', this.model.get('uuid'));
            }, this));
    },

    onCouponValid: function () {
        this.$('.coupon .add-on i').addClass('icon-ok');
        this.$('.coupon .add-on i').removeClass('icon-remove');
        this.$('.coupon.control-group').addClass('success');
        this.$('.coupon.control-group').removeClass('error');
        this.$('.error-text').html("");
    },

    onCouponInvalid: function (msg) {
        this.$('.coupon .add-on i').addClass('icon-remove');
        this.$('.coupon .add-on i').removeClass('icon-ok');
        this.$('.coupon.control-group').addClass('error');
        this.$('.coupon.control-group').removeClass('success');
        this.$('.error-text').html(msg);
    },

    onClickCancel: function () {
        this.$('.coupon .add-on i').addClass('icon-remove');
        this.$('.coupon .add-on i').removeClass('icon-ok');
        this.$('.coupon.control-group').removeClass('error');
        this.$('.coupon.control-group').removeClass('success');
        this.$('#coupon-code').val('');
        this.$('.error-text').html("");
        this.model.clear();
        this.trigger("cancel");
    }


});