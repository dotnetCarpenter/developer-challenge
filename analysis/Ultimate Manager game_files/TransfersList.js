GZ.Views.TransfersList = Backbone.Marionette.CollectionView.extend({
    itemView: GZ.Views.Transfer,

    tagName: 'tbody',

    events: {
        "click .remove": "removePlayer"
    },

    sorterOptions: {
        sortInitialOrder: 'asc',
        sortRestart: true,
        headers: {
            3: { sortInitialOrder: 'desc' }
        }
    },

    initialize: function (options) {
        this.idName = options.idName;
    },

    removePlayer: function(event) {
        var playerId = $(event.target).closest("tr").data("playerid");
        this.trigger("removePlayer", playerId);
    },

    onRender: function () {
        if (!_.isUndefined(this.idName)) {
            this.$el.attr('id', this.idName);
        }
    }

});