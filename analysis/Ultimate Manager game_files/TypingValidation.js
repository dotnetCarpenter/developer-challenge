GZ.Mixins.TypingValidation = {

    initializeTypingValidation: function () {
        // Set up events for typing validation
        var typingEvents = {
            "keyup input.typing-validation": "validateTyping"
        };
        this.events = _.extend(typingEvents, this.events);
    },

    validateTyping: function (evt) {
        var $el = this.$(evt.target),
            attr = $el.data("attribute"),
            isValid = false;

        if (!_.isUndefined(attr)) {
            isValid = this.model.isValueValid(attr, $el.val());
            Marionette.triggerMethod.call(this, "typing:validation", $el, isValid);
        }
    },

    renderControlGroupError: function (field, isValid, errorMessages) {
        var displayMsg;
        if (!_.isArray(errorMessages)) {
            errorMessages = [errorMessages];
        }
        displayMsg = _.map(errorMessages, function (msg) {
            return GZ.helpers.i18n.gettext(msg);
        }, this).join("<br/>");
        field.find('i.typing-validation').toggleClass('icon-ok', isValid);
        field.find('i.typing-validation').toggleClass('icon-remove', !isValid);
        field.toggleClass('error', !isValid);
        field.find('.error-text').html(displayMsg);
    }

};