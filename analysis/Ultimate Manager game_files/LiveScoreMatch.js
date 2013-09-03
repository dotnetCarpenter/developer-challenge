GZ.Views.LiveScoreMatch = Backbone.Marionette.CompositeView.extend({

    template: "#live-score-match",
    tagName: "li",
    className: 'match',
    events: {
        'click .overview': 'toggleActive',
        'click .team': 'selectSquad'
    },
    itemView: GZ.Views.LiveScoreMatchEvent,
    emptyView: GZ.Views.LiveScoreMatchEmptyView,
    itemViewContainer: ".match-events",

    modelEvents: {
        "change": "render"
    },

    options: {
        expandable: true,
        squadsSelectable: false
    },

    initialize: function() {
        this.$el.attr("data-matchid", this.model.get("id"));
        this.$el.attr("data-day", GZ.helpers.date.day(this.model.get("played_on")));
        this.collection = this.model.get('match_events');

        // Rerender the collection on sort.
        this.collection.on("sort", this.render, this);
    },

    toggleActive: function() {
        if (!this.options.expandable) return;
        this.$el.toggleClass('active');
    },

    selectSquad: function(e) {
        if (!this.options.squadsSelectable) return;
        this.trigger('squadSelected', $(e.currentTarget).data('squad-id'));
    }

});