GZ.Models.CreditCard = GZ.Models.TransactionModel.extend({

    urlRoot: GZ.Backend + '/users/me/creditcards',

    defaults: {
        enc_credit_card_number: null,
        enc_expiration_date: null,
        enc_cvv: null,
        enc_cardholder_name: null
    },

    jsonFilters: {
        create: ["enc_cardholder_name", "enc_credit_card_number",
                 "enc_expiration_date", "enc_cvv"]
    },

    cardTypes: [
        { name: 'mastercard', lengths: [16], luhnValidateAble: true, detectionPattern: /^5[1-5]/ },
        { name: 'visa', lengths: [13, 16], luhnValidateAble: true, detectionPattern: /^4/ },
        { name: 'amex', lengths: [15], luhnValidateAble: true, detectionPattern: /^3[47]/ }
    ],

    validate: function(attrs, options) {
        if (_.isString(attrs.enc_cardholder_name) && attrs.enc_cardholder_name.length < 2) {
            return GZ.helpers.i18n.gettext("Please enter cardholder name");
        }
        if (_.isString(attrs.enc_credit_card_number) && attrs.enc_credit_card_number.length < 12 || !this.validateCardNumber(attrs.enc_credit_card_number)) {
            return GZ.helpers.i18n.gettext("The card number you've entered is not valid");
        }
        if (_.isString(attrs.enc_expiration_date) && attrs.enc_expiration_date.length < 7) {
            return GZ.helpers.i18n.gettext("Please enter correct card expiry date");
        }
        if (_.isString(attrs.enc_cvv) && attrs.enc_cvv.length < 3) {
            return GZ.helpers.i18n.gettext("Please enter correct CVV code");
        }
    },

    validateCardNumber: function (card_number, card_type) {
        if (_.isUndefined(card_type)) {
            card_type = this.detectCardType(card_number);
        }

        // Unknown card type
        if (card_type === null) return true;
        // Avoid client-side validation for cards not using Luhn algorithm
        if (!card_type.luhnValidateAble) return true;
        if (_.indexOf(card_type.lengths, card_number.length) < 0) return false;

        var ca,
            sum = 0,
            mul = 1,
            len = card_number.length;

        while (len--) {
            ca = parseInt(card_number.charAt(len), 10) * mul;
            sum += ca - (ca > 9) * 9;
            mul ^= 3;
        }

        return (sum % 10 === 0) && (sum > 0);
    },

    detectCardType: function (card_number) {
        var cardType = _.find(this.cardTypes, function (attr, cardType) {
            return attr.detectionPattern.test(card_number);
        }, this);
        return cardType || null;
    },

    save: function(key, value, options) {
        var attrs;

        // Handle both `("key", value)` and `({key: value})` -style calls.
        if (_.isObject(key) || key === null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        if (!this._validate(attrs, options)) return false;

        var bt = Braintree.create(GZ.config.braintree_key);

        _.each(_.keys(this.defaults), function(key){
            attrs[key] = bt.encrypt(attrs[key]);
        });

        GZ.Models.TransactionModel.prototype.save.call(this, attrs, options);
    }

});