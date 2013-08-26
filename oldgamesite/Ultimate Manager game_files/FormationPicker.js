GZ.Views.FormationPicker = Backbone.Marionette.ItemView.extend({

    template: '#template-formation-picker',

    className: 'formationpicker',

    events: {
        "click": "toggle",
        "click .formations-popup li": "selectFormation"
    },

    ui: {
        popup: '.formations-popup'
    },

    _isOpen: false,

    initialize: function(options) {
        if (_.isUndefined(this.model)) {
            throw new Error("A model must be given");
        }

        this.listenTo(this.model, 'all', this.render, this);
    },

    setModel: function (newModel) {
        this.stopListening(this.model);
        this.model = newModel;
        this.listenTo(this.model, 'all', this.render, this);
    },

    onRender: function () {
        this.$el.toggleClass("open", this._isOpen);
        this.ui.popup.toggleClass("open", this._isOpen);

        if (!_.isUndefined(this.model.formations)) {
            var classesToRemove = _.map(this.model.formations(), _.bind(function(formation, formationName){
                return this.formationClassName(formationName);
            }, this));
            this.$el.removeClass(classesToRemove.join(" "));
            this.$el.addClass(this.formationClassName(this.model.get('formation')));

            var players = this.model.get('players');
            _.each(this.model.formations(), _.partial(this.updateFormation, players), this);
        }
    },

    formationClassName: function(formationName) {
        return 'f' + formationName;
    },

    toggle: function(event) {
        event.stopPropagation();
        this.togglePopup();
    },

    hidePopup: function() {
        this.togglePopup(false);
    },

    togglePopup: function (setOpen) {
        this._isOpen = (!_.isUndefined(setOpen)) ? setOpen : !this._isOpen;
        if (this._isOpen) {
            $('html').on('click', _.bind(this.hidePopup, this));
        } else {
            $('html').off('click', _.bind(this.hidePopup, this));
        }
        this.render();
    },

    updateFormation: function(players, restrictions, formationName) {
        var li = this.ui.popup.find('li.f' + formationName);
        li.data("formation", formationName);
        li.toggleClass('enabled', this.model.canChangeToFormation(formationName));
    },

    selectFormation: function(evt) {
        var newFormation = $(evt.target).data("formation");
        evt.stopPropagation();
        if (!_.isUndefined(newFormation) && this.model.canChangeToFormation(newFormation)) {
            this.model.set('formation', newFormation);
            this.hidePopup();
        }
    }

});