GZ.Views.LiveScore = Backbone.Marionette.CompositeView.extend({

    template: '#template-live-score',
    className: 'live-score',
    itemView: GZ.Views.LiveScoreMatchDay,
    itemViewContainer: ".live-score-match-days",

    options: {
        round: null // null = statRound
    },

    initialize: function() {
        if (this.options.round) {
            this.collection = new Backbone.Collection(this.options.round.getMatchDays());
        }
    },

    onShow: function() {
        this.listenTo(this, 'itemview:squadSelected', this.squadSelected, this);

        if (this.customScrollOn) return;
        this.customScrollOn = true;
        this.$('.live-score-match-days').customScroll();
    },

    onRender: function() {
        if (this.customScrollOn) {
            this.$('.live-score-match-days').customScroll();
        }
    },

    itemViewOptions: function() {
        return _.pick(this.options, 'expandable', 'squadsSelectable');
    },

    squadSelected: function(view, squadId) {
        GZ.app.vent.trigger("fixtures:selectedSquad", squadId);
    }

});