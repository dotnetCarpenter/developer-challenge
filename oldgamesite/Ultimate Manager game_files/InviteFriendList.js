GZ.Views.Modals.InviteFriendListNoItems = Backbone.Marionette.ItemView.extend({

    template: '#template-modal-invite-friend-list-no-items',
    tagName: 'li',
    className: 'none',

    events: {
        'click label': 'emptyClick'
    },

    emptyClick: function(e) {
        if (e) e.preventDefault();
        this.trigger('emptyClick');
    }

});

GZ.Views.Modals.InviteFriendListItem = Backbone.Marionette.ItemView.extend({

    template: '#template-modal-invite-friend-list-item',
    tagName: 'li',

    events: {
        'click': 'toggleFriend'
    },

    toggleFriend: function() {
        var selected = !this.model.get('selected');
        this.model.set('selected', selected);
        this.trigger('selectionChange', selected);
        this.render();
    }

});

GZ.Views.Modals.InviteFriendList = Backbone.Marionette.CompositeView.extend({

    template: '#template-modal-invite-friend-list',

    tagName: 'div',
    className: 'list',

    itemView: GZ.Views.Modals.InviteFriendListItem,
    itemViewContainer: 'ul',

    emptyView: GZ.Views.Modals.InviteFriendListNoItems,

    modelEvents: {
        'change:emptyViewText': 'render'
    },

    showEmptyView: function(){
        var EmptyView = Marionette.getOption(this, "emptyView");

        if (EmptyView && !this._showingEmptyView) {
            this._showingEmptyView = true;
            this.addItemView(this.model, EmptyView, 0);
        }
    }

});