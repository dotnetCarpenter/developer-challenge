(function(superView){

    GZ.Views.PlayerBioMatchListItem = superView.extend({

        className: 'match',
        template: '#template-player-bio-match-item',

        modelEvents: {
            'change': 'render'
        },

        serializeData: function() {
            var data = superView.prototype.serializeData.apply(this, arguments);

            data.playerSquad = this.options.playerSquad;

            return data;
        }

    });

})(Backbone.Marionette.ItemView);