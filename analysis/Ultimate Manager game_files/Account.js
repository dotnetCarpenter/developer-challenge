GZ.Views.Modals.Account = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    className: 'row',
    template: '#template-account',

    regions: {
        fullWidthArea: '.full-width-area',
        mainArea: '.main-area',
        sidebarArea: '.sidebar-area'
    },

    events: {
    },

    initialize: function () {
        this.listenTo(this.sidebarArea, "show", this.onSidebarAreaShow, this);
        this.listenTo(this.sidebarArea, "close", this.onSidebarAreaClose, this);
    },

    onSidebarAreaShow: function () {
        this.$('.sidebar-area').removeClass('hide');
    },

    onSidebarAreaClose: function () {
        this.$('.sidebar-area').addClass('hide');
    },

    showCurrentPlanOverview: function () {
        var v = new GZ.Views.CurrentPlanOverview({
            credit_card: this.model.get('credit_card'),
            plans: this.model.get('paymentplans'),
            model: this.model.get('paymentplans').getActive()
        });
        this.listenTo(v, "change:plan", this.onChangePlan, this);
        this.listenTo(v, "update:creditCard", this.onUpdateCreditCard, this);

        this.fullWidthArea.close();
        this.mainArea.show(v);
        this.sidebarArea.show(new GZ.Views.AccountSettings({
            model: this.model
        }));
    },

    onChangePlan: function () {
        var view = new GZ.Views.AccountPlansOverview();
        this.listenTo(view, "back", this.showCurrentPlanOverview, this);
        this.listenTo(view, "plan:selected", this.showCurrentPlanOverview, this);
        this.mainArea.close();
        this.sidebarArea.close();
        this.fullWidthArea.show(view);
    },

    onUpdateCreditCard: function () {
        var model = new GZ.Models.CreditCard(),
            view = new GZ.Views.AccountCreditCard({
                model: model
            });

        this.listenTo(view, "back", this.showCurrentPlanOverview, this);
        this.listenTo(model, 'transaction:done', this.showCurrentPlanOverview, this);

        this.mainArea.close();
        this.sidebarArea.close();
        this.fullWidthArea.show(view);
    },

    onShow: function () {
        this.showCurrentPlanOverview();
    }

});