GZ.Views.CreateUser = Backbone.Marionette.ItemView.extend(
    _.extend({}, GZ.Mixins.TypingValidation, {

    tagName: 'div',
    // className: 'form-horizontal',
    template: '#template-create-user',

    events: {
        'click .choose-email': 'onToggleUserType',
        'click .regular-user-back': 'onToggleUserType',
        'submit .create-regular-user-form': 'onCreateRegularUser',
        'click .create-facebook-user': 'onCreateFacebookUser'
    },

    initialize: function () {
        this.initializeTypingValidation();
    },

    onRender: function () {
        this.$('.icon-info-sign').tooltip();
    },

    onTypingValidation: function ($el, isValid) {
        var id = $el.attr('id'),
            selectorMap = {
                inputName: '.name',
                inputEmail: '.email',
                inputPassword: '.password'
            };
        if (!_.isUndefined(selectorMap[id])) {
            this.renderControlGroupError(this.$(selectorMap[id]), isValid);
        }
    },

    onToggleUserType: function () {
        if (this.$('.type-chooser-panel:visible').length) {
            this.$('.regular-user-panel').fadeIn();
            this.$('.type-chooser-panel').hide();
            this.$('#inputName').focus();
        } else {
            this.$('.type-chooser-panel').fadeIn();
            this.$('.regular-user-panel').hide();
        }
    },

    onCreateRegularUser: function (evt) {
        var isValid = false;
        evt.preventDefault();

        this.model.set('name', this.$('#inputName').val());
        this.model.set('email', this.$('#inputEmail').val());
        this.model.set('password', this.$('#inputPassword').val());
        this.model.runValidation();

        isValid = this.model.isValid();

        if (!isValid) {
            this.renderModelErrors();
            return;
        }

        this.model.save()
            .fail(_.bind(this.renderModelErrors, this))
            .done(_.bind(this.triggerUserCreated, this));
    },

    triggerUserCreated: function () {
        Marionette.triggerMethod.call(this, "user:created", this.model);
    },

    fetchTeams: function () {
        GZ.Teams.fetch().done(_.bind(this.triggerUserCreated, this));
    },

    renderModelErrors: function () {
        _.each(this.model.errors, function (errors, propertyName) {
            if (!_.isArray(errors)) {
                errors = [errors];
            }
            this.renderControlGroupError(this.$('.'+propertyName), false, errors[0]);
        }, this);
    },

    onCreateFacebookUser: function () {
        this.model.facebookLogin()
            .fail(_.bind(this.renderFacebookError, this))
            .done(_.bind(this.fetchTeams, this));
    },

    renderFacebookError: function (facebookStatus) {
        var errorMsg = [GZ.helpers.i18n.none_gettext("An error occured while signing in to Facebook.")];
        if (facebookStatus == "not_authorized") {
            errorMsg[0] = GZ.helpers.i18n.none_gettext("You must give Ultimate Manager access to your Facebook user.");
        }
        errorMsg.push(GZ.helpers.i18n.none_gettext("Try again or create a user using your e-mail."));
        this.renderControlGroupError(this.$('.facebook'), false, errorMsg);
    }

}));