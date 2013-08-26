GZ.Views.PLStandingsRow = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',
    template: '#template-pl-standings-row'

});

GZ.Views.PLStandingsEmpty = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',
    template: '#template-pl-standings-empty'

});

GZ.Views.PLStandings = Backbone.Marionette.CompositeView.extend({

    tagName: 'div',
    className: 'pl-standings',
    template: '#template-pl-standings',
    itemViewContainer: 'tbody',
    itemView: GZ.Views.PLStandingsRow,
    emptyView: GZ.Views.PLStandingsEmpty,

    setup: false,

    templateHelpers: function () {
        return {
            'league_name': GZ.Leagues.getCurrent().get("common_name")
        };
    },

    initialize: function() {
        _.bindAll(this, 'renderFixedHeaderSortingScroll', 'renderCustomScroll');

        this.collection.on('all', this.renderCustomScroll, this);
    },

    onShow: function() {
        if (this.customScrollOn) return;
        this.customScrollOn = true;
        this.renderFixedHeaderSortingScroll();
        this.$('.live-score-match-days').customScroll();
    },

    onVisible: function() {
        this.renderFixedHeaderSortingScroll();
    },

    renderCustomScroll: function() {
        this.$('.table-container').customScroll();
    },

    renderFixedHeaderSortingScroll: function() {
        var self = this;
        _.defer(function(){
            if (self.setup) return;
            self.setup = true;
            self.$('table')
                .fixedheader({
                    container: self.$el
                })
                .tablesorter();
            self.renderCustomScroll();
        });
    }

});