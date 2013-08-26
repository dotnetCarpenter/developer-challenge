GZ.Views.UserMenu = Backbone.Marionette.ItemView.extend({

    template: "#template-user-menu", // Template: user-menu.html

    tagName: 'ul',
    className: 'nav pull-right',

    events: {
        'click .btn-help': 'navigate',
        'click .btn-account': 'navigate',
        'click .btn-login-dropdown': 'onClickLoginDropdown',
        'click .btn-facebook-login': 'facebookLogin',
        'click .btn-regular-login': 'regularLogin'
    },

    modelEvents: {
        'change': 'render'
    },

    ui: {
        notifications: 'li.notifications-area',
        regularLoginFields: '.fields-regular-login',
        regularLoginError: '.err-regular-login',
        regularEmail: '.inp-regular-email',
        regularPassword: '.inp-regular-password'
    },

    templateHelpers: function () {
        var obj = {};
        obj.isNew = this.model.isNew();
        return obj;
    },

    initialize: function () {
        _.bindAll(this, "onFacebookLoginSuccess", "onFacebookLoginError", "onRegularLoginError");

        this.notifications = new GZ.Collections.Notifications();
        this.notifications.fetch();

        this.notificationsView = new GZ.Views.NotificationList({
            collection: this.notifications
        });
    },

    onRender: function () {
        if (!this.model.isNew()) {
            this.notificationsView.render();
            this.ui.notifications.replaceWith(this.notificationsView.$el);
        }
    },

    navigate: function (evt) {
        var url = $(evt.currentTarget).attr('href');
        evt.preventDefault();
        GZ.router.navigate(url, { trigger: true });
    },

    onClickLoginDropdown: function () {
        _.defer(_.bind(function () {
            this.ui.regularEmail.focus();
        }, this));
    },

    regularLogin: function (evt) {
        var email = this.ui.regularEmail.val(),
            password = this.ui.regularPassword.val();

        evt.preventDefault();

        GZ.User.login(email, password)
            .done(_.bind(function () {
                GZ.Teams.fetch();
            }))
            .error(this.onRegularLoginError);
    },

    onRegularLoginError: function (jqXHR) {
        var data = JSON.parse(jqXHR.responseText),
            errStr = GZ.helpers.i18n.gettext('An unknown error occured.'),
            errMap = {
                'Wrong login or password': GZ.helpers.i18n.gettext('We could not log you in, the E-mail or password is wrong.'),
                'Error while validating the arguments': GZ.helpers.i18n.gettext('We could not log you in, the E-mail or password is wrong.')
            };

        if (data.status == "error") {
            errStr = errMap[data.message] || GZ.helpers.i18n.gettext(data.message);
        }
        this.ui.regularLoginError.html(errStr);
        this.ui.regularLoginFields.addClass('error');
        this.ui.regularLoginError.removeClass('hide');
    },

    facebookLogin: function () {
        GZ.helpers.facebook.login({'scope': 'email'})
            .pipe(this.backendLoginFacebook, this.onFacebookLoginError)
            .done(this.onFacebookLoginSuccess)
            .fail(this.onFacebookLoginError);
    },

    backendLoginFacebook: function (facebookAuthResponse) {
        return $.post('/api/login/facebook', "token="+facebookAuthResponse.accessToken, 'json');
    },

    onFacebookLoginSuccess: function () {
        GZ.User.fetch();
        GZ.Teams.fetch();
    },

    onFacebookLoginError: function () {
        console.error('facebook login err', arguments);
    }

});