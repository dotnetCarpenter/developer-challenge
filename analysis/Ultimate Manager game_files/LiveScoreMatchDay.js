GZ.Views.LiveScoreMatchDay = Backbone.Marionette.CompositeView.extend({

    template: '#template-live-score-match-day',
    className: 'match-day',
    itemView: GZ.Views.LiveScoreMatch,
    itemViewContainer: 'ul',

    initialize: function() {
        this.collection = new GZ.Collections.SortedMatches(this.model.get('matches'));
    },

    itemViewOptions: function() {
        return _.pick(this.options, 'expandable', 'squadsSelectable');
    },

    squadSelected: function(view, squadId) {
        this.trigger('squadSelected', squadId);
    },

    onShow: function () {
        this.listenTo(this, 'itemview:squadSelected', this.squadSelected, this);
    }

});