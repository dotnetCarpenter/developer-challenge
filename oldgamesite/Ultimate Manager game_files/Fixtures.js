GZ.Views.Fixtures = Backbone.Marionette.Layout.extend({

    template: '#template-fixtures',

    events: {
        "click .previous": "showPrevious",
        "click .next": "showNext"
    },

    ui: {
        'btnPrevious': '.previous',
        'btnNext': '.next'
    },

    regions: {
        matchesArea: '.matches',
        standingsArea: '.standings'
    },

    selectedRound: null,

    initialize: function() {
        this.selectedRound = GZ.app.reqres.request("league:status:matchday");

        this.plStandings = new GZ.Views.PLStandings({
            model: new Backbone.Model({}),
            collection: new GZ.Collections.PLStandings()
        });
        this.plStandings.collection.fetch();
    },

    canShowPrevious: function () {
        return this.selectedRound > 1;
    },

    showPrevious: function() {
        if (this.canShowPrevious()) {
            this.selectedRound = Math.max(1, this.selectedRound - 1);
            this.showSelectedLiveScoreRound();
            this.renderButtonState();
        }
    },

    canShowNext: function () {
        return this.selectedRound < this.collection.length;
    },

    showNext: function() {
        if (this.canShowNext()) {
            this.selectedRound = Math.min(this.collection.length, this.selectedRound + 1);
            this.showSelectedLiveScoreRound();
            this.renderButtonState();
        }
    },

    showSelectedLiveScoreRound: function () {
        var livescore = new GZ.Views.LiveScore({
            round: this.collection.getRoundForMatchday(this.selectedRound),
            expandable: false,
            squadsSelectable: true
        });
        this.matchesArea.show(livescore);
    },

    onRender: function() {
        this.$el.attr('id', 'fixtures');

        this.renderButtonState();

        this.showSelectedLiveScoreRound();
        this.standingsArea.show(this.plStandings);
    },

    renderButtonState: function () {
        // selectedRound are 1-indexed in the collection
        this.ui.btnPrevious.toggleClass('disabled', !this.canShowPrevious());
        this.ui.btnNext.toggleClass('disabled', !this.canShowNext());
    }

});