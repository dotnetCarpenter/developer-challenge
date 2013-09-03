GZ.Views.SetTeamName = Backbone.Marionette.ItemView.extend(
    _.extend({}, GZ.Mixins.TypingValidation, {

    tagName: 'div',
    template: '#template-set-team-name',

    events: {
        'submit .set-team-name-form': 'onSubmit'
    },

    initialize: function () {
        this.initializeTypingValidation();
    },

    onTypingValidation: function ($el, isValid) {
        this.renderControlGroupError(this.$('.name'), isValid);
    },

    onRender: function () {
        this.$('.icon-info-sign').tooltip();
    },

    onShow: function () {
        this.$('#team-name').focus();
    },

    onSubmit: function (evt) {
        var isValid = false;
        evt.preventDefault();

        this.model.set('name', this.$('#team-name').val());
        this.model.runValidation();

        isValid = this.model.isValid();

        if (!isValid) {
            this.renderControlGroupError(this.$('.name'), isValid, this.model.errors.name);
            return;
        }

        Marionette.triggerMethod.call(this, "name:set", this.model);
    }


}));