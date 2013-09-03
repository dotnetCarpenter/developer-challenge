GZ.Views.AccountSettings = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'account-settings',
    template: '#template-account-settings',

    ui: {
        cancel_subscription: '.cancel-subscription',
        cancel_subscription_spinner: '.cancel-subscription a .spinner',
        delete_account_link: '.delete-account-box .delete-account',
        delete_account_confirm_text: '.delete-account-box .confirmation'
    },

    events: {
        'click .toggle-open': 'onToggleOpen',
        'click .cancel-edit': 'onCancelEdit',
        'submit form.email': 'onSaveForm',
        'submit form.password': 'onSavePasswordForm',
        'submit form.language': 'onSaveForm',

        'click .delete-account': 'deleteAccount',
        'click .confirm-delete-account': 'confirmDeleteAccount'
    },

    initialize: function () {
        this.listenTo(this.model, "change", this.render, this);
        this.listenTo(this.model, "change:language", this.onLanguageChanged, this);
    },

    templateHelpers: function () {
        var currentLanguage = this.model.get('language'),
            languages = [
                { code: 'da_DK', label: 'Dansk' },
                { code: 'de_DE', label: 'Deutsch' },
                { code: 'en_US', label: 'English' },
                { code: 'fr_FR', label: 'Français' },
                { code: 'pt_BR', label: 'português do Brasil' }
            ],
            languageLabel = _.find(languages, function(item){
                return item.code == currentLanguage;
            }).label;
        return {
            languages: languages,
            languageLabel: languageLabel,
            showSettingPassword: !this.model.has('facebook_id'),
            showSettingEmail: !this.model.has('facebook_id')
        };
    },

    onToggleOpen: function (evt) {
        var $currentTarget = $(evt.currentTarget),
            selector = $currentTarget.data('target'),
            $el = this.$(selector);
        evt.preventDefault();
        this.$('.open').not($el).removeClass('open');
        $el.toggleClass('open');
        $el.find('input:first').focus();
    },

    onCancelEdit: function (evt) {
        evt.preventDefault();
        this.render();
    },

    onSavePasswordForm: function (evt) {
        var $ct = $(evt.currentTarget),
            arrayData = $ct.serializeArray(),
            data = _.reduce(arrayData, function (memo, it) {
                memo[it.name] = it.value; return memo;
            }, {});

        evt.preventDefault();
        if (data.password != data.password_confirm) {
            this.renderFormError($ct, 'password', GZ.helpers.i18n.gettext('The passwords must match.'));
            return;
        }
        delete data.password_confirm;
        this.saveModelData($ct, data);
    },

    onSaveForm: function (evt) {
        var $ct = $(evt.currentTarget),
            arrayData = $ct.serializeArray(),
            data = _.reduce(arrayData, function (memo, it) {
                memo[it.name] = it.value; return memo;
            }, {});

        evt.preventDefault();
        this.saveModelData($ct, data);
    },

    saveModelData: function ($form, data) {
        var oldSaveText = $form.find('.save-indicator').html();

        $form.find('.control-group').removeClass('error');
        $form.find('button').attr('disabled', 'disabled');
        $form.find('.save-indicator').html(GZ.helpers.i18n.gettext('Saving')+"..");

        this.model.save(data, { wait: true, patch: true })
            .fail(_.bind(function () {
                _.map(this.model.errors, function (errors, field) {
                    this.renderFormError($form, field, errors[0]);
                }, this);

                $form.find('button').removeAttr('disabled');
                $form.find('.save-indicator').html(oldSaveText);
            }, this))
            .done(_.bind(this.render, this));
    },

    renderFormError: function ($form, field, msg) {
        $form.find('.control-group').addClass('error');
        $form.find('[data-for='+field+']').html(msg);
    },

    onLanguageChanged: function () {
        window.location.reload();
    },

    deleteAccount: function () {
        this.ui.delete_account_link.hide();
        this.ui.delete_account_confirm_text.fadeIn('fast');
    },

    confirmDeleteAccount: function () {
        GZ.User.destroy();
        window.location.href = "/";
    }

});