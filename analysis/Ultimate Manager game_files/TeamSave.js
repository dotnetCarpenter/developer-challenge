GZ.Views.Modals.TeamSave = Backbone.Marionette.Layout.extend({

    tagName: 'div',
    className: 'team-save',
    template: '#template-team-save',

    regions: {
        progressBarArea: '.top-progress',
        viewArea: '.team-save-modal-flow'
    },

    stepViews: [],
    currentStep: -1,

    initialize: function () {
        this.coupon = new GZ.Models.Coupon();
    },

    setupSteps: function () {
        var collection = new Backbone.Collection(),
            validPackages, activePlan;
        this.stepViews = [];
        this.stepViews.push({
            title: GZ.helpers.i18n.gettext('Team name'),
            generator: _.bind(function () {
                var v = new GZ.Views.SetTeamName({
                    model: this.options.team
                });
                this.listenTo(v, "name:set", this.showNextStep, this);
                return v;
            }, this)
        });

        if (this.options.user.isNew()) {
            this.stepViews.push({
                title: GZ.helpers.i18n.gettext('User'),
                generator: _.bind(function () {
                    var v = new GZ.Views.CreateUser({
                        model: this.options.user
                    });
                    this.listenTo(v, "user:created", this.onUserCreated, this);
                    return v;
                }, this)
            });
        }

        if (!this.options.user.canCreateExtraTeam(this.options.team)) {
            this.stepViews.push({
                title: GZ.helpers.i18n.gettext('Plan'),
                generator: _.bind(function () {
                    var validPackages = this.options.user.getSatisfactoryPlans(this.options.team),
                        v = new GZ.Views.PlansOverview({
                            coupon: GZ.Teams.length > 0 ? undefined : this.coupon,
                            upgrade: GZ.Teams.length > 0,
                            validPackages: validPackages,
                            extraInfo: (GZ.Teams.length > 0) ? GZ.helpers.i18n.gettext("Your current plan does not allow you to create the new team. But no worries, you can upgrade your plan right here") : ""
                        });
                    this.listenTo(v, "plan:selected", this.onPlanSelected, this);
                    return v;
                }, this)
            });
            // Only show payment step when we do not have a credit card
            if (!this.options.user.has("credit_card")) {
                this.stepViews.push({
                    title: GZ.helpers.i18n.gettext('Payment'),
                    generator: _.bind(function () {
                        var v = new GZ.Views.PlanCreditCardOverview({
                            creditCard: this.options.user.get('credit_card') || new GZ.Models.CreditCard(),
                            coupon: this.coupon,
                            plan: this.options.user.get("paymentplans").getPending() || this.options.user.get("paymentplans").getActive()
                        });
                        this.listenTo(v, "creditcard:saved", this.showNextStep, this);
                        return v;
                    }, this)
                });
            }
        }

        _.each(this.stepViews, function (step) {
            collection.add({ title: step.title });
        }, this);
        this.progressBar = new GZ.Views.ProgressBar({
            collection: collection
        });
    },

    showStep: function (newStep, fade) {
        Marionette.triggerMethod.call(this, "before:show:step", newStep, fade);
        if (this.currentStep !== newStep && !_.isUndefined(this.stepViews[newStep])) {
            this.currentStep = newStep;
            this.progressBar.setCurrentItem(newStep);
            if (!!fade) {
                this.$('.team-save-modal-flow').fadeOut(_.bind(function () {
                    this.viewArea.show(this.stepViews[newStep].generator());
                    this.$('.team-save-modal-flow').fadeIn();
                }, this));
            } else {
                this.viewArea.show(this.stepViews[newStep].generator());
            }
        }
    },

    onBeforeShowStep: function (newStep, fade) {
        // Check if we are at the last step.
        if (this.currentStep === this.stepViews.length-1) {
            // Close this shit and save the fucking team!
            this.options.team.save(null, { wait: true })
                .fail(function () {
                    alert(GZ.helpers.i18n.gettext('An error occured, trying to save the team.'));
                })
                .done(_.bind(function () { this.finish(); }, this));
        }
    },

    showNextStep: function () {
        this.showStep(this.currentStep+1, true);
    },

    onPlanSelected: function (plan, coupon) {
        this.options.user.fetch().then(_.bind(function () {
            this.showNextStep();
        }, this));
    },

    onUserCreated: function () {
        this.showProgressBar();
        this.currentStep = 0;
        this.showStep(1);
    },

    onShow: function () {
        this.showProgressBar();
        this.showStep(0);
    },

    showProgressBar: function () {
        this.setupSteps();
        if (this.stepViews.length > 1) {
            this.progressBarArea.show(this.progressBar);
        }
    },

    finish: function () {
        GZ.helpers.track.pageview("/signup/complete");
        this.trigger("save");
    }


});