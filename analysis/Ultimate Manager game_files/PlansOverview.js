GZ.Views.PlansOverview = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    template: '#template-plans-overview',

    regions: {
        'redeemCouponRegion': '.redeem-coupon-region'
    },

    ui: {
        'redeemCouponRegion': '.redeem-coupon-region'
    },

    events: {
        'click .btn-toggle-redeem': 'onToggleRedeemCouponRegion',
        'click .select-package': 'onClickSelectPackage'
    },

    allPackages: ["basic", "extra", "ultimate"],

    couponView: undefined,

    templateHelpers: function () {
        return {
            'showCoupon': !_.isUndefined(this.options.coupon),
            'upgrade': !_.isUndefined(this.options.upgrade) && this.options.upgrade === true,
            'extraInfo': this.options.extraInfo || "",
            'hideTrialBanner': !!this.options.hideTrialBanner
        };
    },

    onShow: function () {
        if (!_.isUndefined(this.options.coupon)) {
            this.couponView = new GZ.Views.RedeemCoupon({
                model: this.options.coupon
            });
            this.redeemCouponRegion.show(this.couponView);
            this.listenTo(this.couponView, "cancel", this.onToggleRedeemCouponRegion, this);
            this.listenTo(this.couponView, "coupon:valid", this.onCouponValid, this);
            this.listenTo(this.couponView, "coupon:invalid", this.onCouponInvalid, this);
        }
        if (!_.isUndefined(this.options.validPackages)) {
            this.renderPackagesDisabledState(this.options.validPackages);
        }
    },

    onCouponValid: function (code) {
        this.renderPackagesDisabledState([this.couponView.model.get('required_plan')]);
    },

    onCouponInvalid: function (code) {
        this.renderPackagesDisabledState();
    },

    onToggleRedeemCouponRegion: function () {
        this.redeemShown = !this.redeemShown;
        this.$('.redeem-coupon-slider').toggleClass('state-flip');
        if (this.redeemShown) {
            this.$('.btn-toggle-redeem').fadeOut();
            this.$('.redeem-coupon-region').fadeIn();
            Marionette.triggerMethod.call(this.couponView, "focus");
        } else {
            this.renderPackagesDisabledState();
            this.$('.btn-toggle-redeem').fadeIn();
            this.$('.redeem-coupon-region').fadeOut();
        }
    },

    onClickSelectPackage: function (evt) {
        var $el = $(evt.currentTarget),
            pkg = $el.data('package');

        this.$el.addClass('modal-loading');
        this.selectedPlan = new GZ.Models.Plan({
            plan: pkg
        });
        if (!_.isUndefined(this.options.coupon) && this.options.coupon.isRedeemable()) {
            this.selectedPlan.set('coupon', this.options.coupon.get('uuid'));
        }
        this.listenTo(this.selectedPlan, "transaction:error", function () {
            console.error("Argh, transaction err", arguments);
            this.$el.removeClass('modal-loading');
        }, this);
        this.listenTo(this.selectedPlan, "transaction:failure", function () {
            console.error("Argh, transaction err", arguments);
            this.$el.removeClass('modal-loading');
        }, this);
        this.listenTo(this.selectedPlan, "transaction:done", function () {
            this.$el.removeClass('modal-loading');
            this.trigger('plan:selected', this.selectedPlan, this.options.coupon);
        }, this);
        this.selectedPlan.save(null, {
                wait: true,
                success: function(model) {
                    model.observeTransaction();
                },
                error: _.bind(function () {
                    console.error("err saving plan", arguments);
                    this.$el.removeClass('modal-loading');
                }, this)
            });
    },

    renderPackagesDisabledState: function (validPackages) {
        if (_.isUndefined(validPackages)) {
            validPackages = this.allPackages;
        }
        _.each(this.allPackages, function (pkg) {
            if (_.contains(validPackages, pkg)) {
                this.$('#package-'+pkg).removeClass('disabled');
                this.$('#package-'+pkg+' .select-package').removeClass('disabled');
            } else {
                this.$('#package-'+pkg).addClass('disabled');
                this.$('#package-'+pkg+' .select-package').addClass('disabled');
            }
        });
    }

});