GZ.Views.GroupCreate = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'group-create',
    template: '#template-group-create',

    events: {
        'click button.create': 'createGroup',
        'click .join button': 'searchGroups'
    },

    ui: {
        error: '.create-group-error'
    },

    initialize: function() {
        this.on('shown', this.viewShown, this);
        this.on('hid', this.viewHid, this);
    },

    viewShown: function() {
        // Putting render here will save some rendering resources on the client machine
        this.render();
    },

    viewHid: function() {
    },

    onRender: function () {
        this.delegateEvents();
    },

    createGroup: function() {
        var name = $.trim(this.$('input[name="name"]').val()),
            is_private = this.$('input[name="is_private"]').is(':checked'),
            group = new GZ.Models.Group(),
            reset = _.bind(function() {
                this.$('input[name="name"]').val('');
                this.$('input[name="is_private"]').removeAttr('checked');
            }, this);

        var saveStatus = group.save({
            "name": name,
            "is_private": is_private ? 1 : 0,
            "team_id": GZ.Teams.getCurrent().get("id")
        }, {
            success: function(model, response) {
                model.set('member', true);
                reset();
                GZ.app.vent.trigger('group:joined', model);
            },
            error: _.bind(function(model, error, options) {
                if (_.isString(error)) {
                    this.displayError('The group was not created due to an error: ' + error);
                } else {
                    this.displayError('The group was not created due to an unknown error');
                }
            }, this)
        });
        if (!saveStatus) {
            this.displayError(group.validationError);
        }

        GZ.helpers.track.event("Groups", "Create");
    },

    searchGroups: function() {
        GZ.app.vent.trigger('groups:search');
    },

    displayError: function(str) {
        this.ui.error.html(str);
    }

});