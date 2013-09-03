GZ.Views.TeamSelectorItem = Backbone.Marionette.ItemView.extend({
    template: '#template-team-selector-item', // Template: team-selector-item.html

    tagName: 'li',
    className: 'team',

    events: {
        "click a": "selectTeam"
    },

    templateHelpers: function () {
        var l = this.model.getLeague(),
            league_name = l.get("common_name");
        if (l.isReplay()) {
            league_name += " - " + l.getSeasonName();
        }
        return {
            'league_name': league_name
        };
    },

    selectTeam: function (evt) {
        evt.preventDefault();
        if (!_.isUndefined(this.model.collection)) {
            GZ.app.vent.trigger('app:showTeam', this.model);
        }
    }
});

GZ.Views.TeamSelector = Backbone.Marionette.CompositeView.extend({

    template: "#template-team-selector", // Template: team-selector.html

    tagName: 'li',
    className: 'team-selector dropdown',

    itemView: GZ.Views.TeamSelectorItem,
    itemViewContainer: "ul.teams",

    events: {
        'click .create-team a': 'createTeam'
    },

    templateHelpers: function () {
        var l = GZ.Leagues.getCurrent(),
            league_name = l.get("common_name");
        if (l.isReplay()) {
            league_name += " - " + l.getSeasonName();
        }
        return {
            'league_name': league_name
        };
    },

    initialize: function () {
        if (_.isUndefined(this.collection)) {
            throw new Error("A collection must be given");
        }

        this.listenTo(this, "render", this.toggleDividerHide, this);
        this.listenTo(this, "after:item:added", this.toggleDividerHide, this);
        this.listenTo(this, "item:removed", this.toggleDividerHide, this);
    },

    toggleDividerHide: function () {
        this.$('li.divider').toggleClass('hide', !this.collection.length);
    },

    appendHtml: function(cv, iv){
        var $container = this.getItemViewContainer(cv);
        $container.find('li.divider').before(iv.el);
    },

    createTeam: function (evt) {
        evt.preventDefault();
        GZ.router.navigate('team/new', { trigger: true });
    }

});