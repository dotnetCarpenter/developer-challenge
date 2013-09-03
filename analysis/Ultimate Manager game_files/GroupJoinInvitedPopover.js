GZ.Views.GroupJoinInvitedPopover = Backbone.Marionette.ItemView.extend({

    template: '#template-group-join-invited-popover',

    events: {
        'click button': 'joinGroup'
    },

    ui: {
        'teamSelector': '.join-invited-popover-team'
    },

    joinGroup: function () {
        var team_id = this.ui.teamSelector.val();
        this.trigger('joinGroup', team_id);
    }

});