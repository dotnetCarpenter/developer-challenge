GZ.Views.ManagerProfileGroupsItem = Backbone.Marionette.ItemView.extend({

    template: '#template-manager-profile-groups-item', // Template: manager-profile-groups-item.html
    tagName: "tr",

    events: {
        'click .action-view': 'view'
    },

    view: function (evt) {
        GZ.router.navigate('/match/group/'+this.model.get('id'), {trigger: true});
    }

});
