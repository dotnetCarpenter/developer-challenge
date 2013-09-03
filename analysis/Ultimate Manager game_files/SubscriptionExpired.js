GZ.Views.Modals.SubscriptionExpired = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'subscription-expired',
    template: '#template-modals-subscription-expired',

    ui: {
        credit_card_container: '.card-container div',
        trial_progress_bar_container: '.trial-progress-bar-container',
        payment_sub_title: '.payment .sub-title'
    },

    events: {
        'click .plans button': 'selectPlan',
        'click .payment .sub-title a': 'changePlan',
        'click a[href="#continue"]': 'continueTrial'
    },

    selectedPlan: null,

    initialize: function () {
        var credit_card = new GZ.Models.CreditCard();
        if (!GZ.User.get('credit_card') || GZ.User.get('credit_card') === null) {
            GZ.User.set('credit_card', credit_card);
        }
        this.trialProgressBar = new Backbone.Marionette.ItemView({
            tagName: 'div',
            template: '#template-trial-progress-bar',
            model: this.model
        });
        this.creditCardView = new GZ.Views.CreditCard({
            model: credit_card
        });
        this.creditCardView.model.on('transaction:done', function(){
            GZ.User.fetch();

            var plan = new GZ.Models.Plan({
                plan: this.selectedPlan.id,
                currency: GZ.User.getCurrency()
            });
            plan.on('transaction:error', function(message){
                    this.creditCardView.enableForm();
                    alert(message);
                }, this)
                .on('transaction:failure', function(message){
                    this.creditCardView.enableForm();
                    alert(message);
                }, this)
                .on('transaction:done', function(){
                    GZ.User.get('paymentplans').fetch();
                });
            plan.save(null, {
                    wait: true,
                    success: function(model) {
                        model.observeTransaction();
                        GZ.helpers.modal.close();
                    },
                    error: function () {
                        console.error("err", arguments);
                    }
                });
        }, this);
    },

    onRender: function() {
        var $creditCardEl = this.creditCardView.render().$el;
        this.ui.credit_card_container.replaceWith($creditCardEl);
        var $trialProgressBarEl = this.trialProgressBar.render().$el;
        this.ui.trial_progress_bar_container.replaceWith($trialProgressBarEl.html());

        _.defer(_.bind(function(){
            var $progress = this.$('.alt-progress-bar .progress'),
                width = $progress.css('width');

            $progress.css({width: '3px', opacity: 0});

            _.delay(function(){
                $progress.animate({ width: width, opacity: 0.99 }, 1000).css('overflow', 'visible');
            }, 1000);
        }, this));
    },

    selectPlan: function(evt) {
        if (!evt) return;
        evt.preventDefault();

        var plan = $(evt.currentTarget).parents('.plan').data('plan');
        if (_.isUndefined(plan) || _.indexOf(GZ.Collections.Plans.K.plans, plan.id) == -1) {
            alert('An unknown error occured. Please contact support.');
            throw new Error('Error when user select payment plan in subscription exp. modal');
        }

        this.panToPayment(plan);
    },

    changePlan: function(evt) {
        if (evt) evt.preventDefault();
        this.panTo(0);
    },

    continueTrial: function(evt) {
        if (evt) evt.preventDefault();
        GZ.helpers.modal.close();
    },

    panToPayment: function(plan) {
        GZ.helpers.i18n.none_gettext("You'll be charged £3.99 monthly");
        GZ.helpers.i18n.none_gettext("You'll be charged £19.99 once");
        this.ui.payment_sub_title.find('span.charge-text').html(GZ.helpers.i18n.gettext("You'll be charged £"+plan.price+" "+plan.frequence));
        this.panTo(1);
        this.selectedPlan = plan;
    },

    panTo: function(index) {
        this.$('.pane').animate({
            left: (-100 * index) + '%'
        }, {
            queue: false
        });
    }

});