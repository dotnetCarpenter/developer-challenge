GZ.Views.CurrentPlanOverview = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'row current-plan-overview',
    template: '#template-current-plan-overview',

    events: {
        'click .action-cancel-subscription': 'onCancelSubscription',
        'click .action-change-plan': 'onChangePlan',
        'click .action-update-credit-card': 'onUpdateCreditCard'
    },

    isLoading: false,

    templateHelpers: function () {
        var pendingPlan = this.options.plans.getPending(),
            data = {};

        data.hasCreditCard = GZ.User.has("credit_card");
        data.hasPlan = !_.isUndefined(this.model);
        data.creditCard = "-";
        if (GZ.User.has("credit_card")) {
            data.creditCard = GZ.User.get("credit_card").get("kind")+" XXXX "+GZ.User.get("credit_card").get("last_4");
        }

        if (!_.isUndefined(pendingPlan)) {
            data.pendingPlan = this.options.plans.getPending().get("plan");
            data.pendingPlanDate = this.options.plans.getPending().get("next_billing_date");
        }
        return data;
    },

    renderLoading: function () {
        if (this.isLoading) {
            this.$('.actions button').attr('disabled', 'disabled');
        } else {
            this.$('.actions button').removeAttr('disabled');
        }
        this.$el.toggleClass('framed-loading', this.isLoading);
    },

    setLoading: function (newState) {
        this.isLoading = newState;
        this.renderLoading();
    },

    onShow: function () {

    },

    onCancelSubscription: function () {
        var planForDeletion = this.options.plans.getActive();
        if (!_.isUndefined(planForDeletion)) {
            this.setLoading(true);
            this.listenTo(planForDeletion, 'transaction:error', _.bind(function(message){
                this.setLoading(false);
                alert(message);
                console.error('transaction:error', arguments);
            }, this));
            this.listenTo(planForDeletion, 'transaction:failure', _.bind(function(message){
                this.setLoading(false);
                alert(message);
                console.error('transaction:failure', arguments);
            }, this));
            this.listenTo(planForDeletion, 'transaction:done', _.bind(function(){
                this.model.get("paymentplans").fetch().then(_.bind(function () {
                    this.setLoading(false);
                }, this));
            }, this));
            planForDeletion.cancel().then(function(data) {
                planForDeletion.observeTransaction(data.response.transaction);
            });
        }
    },

    onChangePlan: function () {
        this.trigger('change:plan');
    },

    onUpdateCreditCard: function () {
        this.trigger('update:creditCard');
    }

});