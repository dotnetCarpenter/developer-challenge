GZ.Views.CreditCard = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'credit-card-container',
    template: '#template-credit-card',

    ui: {
        input: 'input',
        credit_card: '.credit-card',
        credit_card_holder: 'input[name=card_holder]',
        credit_card_no: 'input[name=card_no]',
        credit_card_expiry_month: 'input[name=card_expiry_month]',
        credit_card_expiry_year: 'input[name=card_expiry_year]',
        credit_card_cvv: 'input[name=card_cvv]',
        credit_card_general_error: '.general-error',
        update_credit_card_button: 'button.update-credit-card',
        verifying: '.verifying',
        verifying_label: '.verifying label'
    },

    events: {
        'keyup input[name=card_no]': 'detectCreditCardType',
        'blur input[name=card_no]': 'validateCardNumber',
        'click button.update-credit-card': 'updateCreditCard'
    },

    templateHelpers: function () {
        return {
            btnText: this.options.btnText
        };
    },

    initialize: function () {
        if (_.isUndefined(this.model)) {
            throw "A credit card model must be supplied to a credit card view.";
        }
    },

    detectCreditCardType: function(evt) {
        var type = this.model.detectCardType(this.ui.credit_card_no.val());

        this.ui.credit_card.removeClass(_.pluck(this.model.cardTypes, 'name').join(" "));

        if (type) this.ui.credit_card.addClass(type.name);
    },

    validateCardNumber: function(evt) {
        var cardNumber = this.ui.credit_card_no.val();

        if (!this.model.validateCardNumber(cardNumber)) {
            this.ui
                .credit_card_no
                .addClass('error')
                .one('keyup', _.bind(function(){
                    this.ui.credit_card_no.removeClass('error');
                }, this));
        }
    },

    updateCreditCard: function() {
        var texts = [
                GZ.helpers.i18n.gettext('Verifying your credit card'),
                GZ.helpers.i18n.gettext('Still processing'),
                GZ.helpers.i18n.gettext("Hold on, we're still working")
            ],
            currentText = 0;

        this.$('.control-group').removeClass('error');
        this.ui.credit_card_general_error.html("");
        this.disableForm();

        // If we don't have a new model, we'll jsut fake that the card was correctly saved.
        if (!this.model.isNew()) {
            this.model.trigger('transaction:done');
            return;
        }

        this.model
            .on('transaction:error', this.displayErrors, this)
            .on('transaction:failure', this.displayErrors, this)
            .on('transaction:processing', function(){
                this.ui.verifying_label.html(texts[currentText]);
                if (++currentText > texts.length-1) currentText = 0;
            }, this)
            .save({
                enc_credit_card_number: this.ui.credit_card_no.val(),
                enc_expiration_date: this.ui.credit_card_expiry_month.val() + '/20' + this.ui.credit_card_expiry_year.val(),
                enc_cvv: this.ui.credit_card_cvv.val(),
                enc_cardholder_name: this.ui.credit_card_holder.val()
            }, {
                wait: true,
                silent: true,
                success: function(model, data) {
                    model.observeTransaction();
                },
                error: _.bind(function(model, data) {
                    this.enableForm();
                    if (_.isString(data)) return alert(data);
                    alert(GZ.helpers.i18n.gettext('An error occurred processing your credit card. Please try again or contact support.'));
                }, this)
            });
    },

    onRender: function () {
        if (!this.model.isNew()) {
            // Ok we got an existing credit card, let's disable the shit out of this form
            this.ui.credit_card.addClass(this.model.get('kind'));
            this.ui.credit_card_holder.attr("disabled", "disabled");
            this.ui.credit_card_no.attr("disabled", "disabled");
            this.ui.credit_card_no.val("XXXX XXXX XXXX "+this.model.get("last_4"));
            this.ui.credit_card_expiry_month.attr("disabled", "disabled");
            this.ui.credit_card_expiry_month.val(this.model.get("expiration_month"));
            this.ui.credit_card_expiry_year.attr("disabled", "disabled");
            this.ui.credit_card_expiry_year.val(this.model.get("expiration_year").slice(-2));
            this.ui.credit_card_cvv.attr("disabled", "disabled");
        }
    },

    enableForm: function () {
        this.ui.verifying.hide();
        this.ui.update_credit_card_button.show();
        this.ui.input.removeAttr('disabled');
    },

    disableForm: function () {
        this.ui.verifying_label.html(GZ.helpers.i18n.gettext('Verifying your credit card'));
        this.ui.verifying.show();
        this.ui.update_credit_card_button.hide();
        this.ui.input.attr('disabled', 'disabled');
    },


    displayErrors: function (message, errors) {
        var errorsShown = 0;
        this.enableForm();
        if (!_.isUndefined(errors)) {
            _.forEach(errors, function (err) {
                if (err.type == "validation") {
                    if (err.attribute == "number") {
                        this.$('.cg-card-number').addClass("error");
                        errorsShown++;
                    }
                    if (err.attribute == "expiration_date") {
                        this.$('.cg-expiry').addClass("error");
                        errorsShown++;
                    }
                    if (err.attribute == "cvv") {
                        this.$('.cg-cvv').addClass("error");
                        errorsShown++;
                    }
                } else if (err.type == "gateway" && err.attribute == "cvv") {
                    this.$('.cg-cvv').addClass("error");
                    errorsShown++;
                }
            }, this);
        }

        if (errorsShown === 0) {
            this.ui.credit_card_general_error.html(GZ.helpers.i18n.gettext("Your credit card could not be verified. Please ensure the information is correct."));
        }
    }

});