GZ.Views.PlayerBioMatchList = Backbone.Marionette.CollectionView.extend({

    itemView: GZ.Views.PlayerBioMatchListItem,
    itemViewOptions: function() {
        return {
            playerSquad: this.options.playerSquad
        };
    },

    update: function(collection, playerSquad) {
        this.options.playerSquad = playerSquad;
        this.collection.reset(collection);
    }

});