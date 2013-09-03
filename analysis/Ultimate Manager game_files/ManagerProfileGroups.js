GZ.Views.ManagerProfileGroups = Backbone.Marionette.CompositeView.extend({

    tagName: 'table',
    template: '#template-manager-profile-groups',  // Template: manager-profile-groups.html
    itemViewContainer: "tbody",
    itemView: GZ.Views.ManagerProfileGroupsItem,
    className: 'gradient-header',

    itemViewOptions: {},

    setCollection: function (newCollection) {
        this.stopListening(this.collection);
        this.collection = newCollection;
        this._initialEvents();
        this.render();
    }

});