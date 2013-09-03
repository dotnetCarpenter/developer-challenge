GZ.Views.Pitch = Backbone.Marionette.ItemView.extend({

    template: '#template-pitch',

    className: 'pitch',
    tagName: 'div',

    itemView: GZ.Views.PitchPlayer,
    itemViewContainer: "ul.playergrid",
    itemViewOptions: function (model) {
        var options = {};
        if (!_.isUndefined(this.hoverMenu)) {
            options.hoverMenu = this.hoverMenu;
        }
        return options;
    },

    events: {
        'click li': 'clickPlayer'
    },

    ui: {
        'playergrid': '.playergrid',
        'tabs': '.pitch-tabs',
        'futureTeamNotice': '.future-team-notice',
        'pitchInfo': '.pitch-info'
    },

    tabs: [],
    loading: false,

    modelEvents: {
        "change": "render"
    },

    collectionEvents: {
        "add": "render",
        "remove": "render",
        "reset": "render"
    },

    initialize: function(options) {
        if (_.isUndefined(this.model)) {
            throw new Error("A model must be given");
        }

        this.collection = this.model.get("players");

        if (!_.isUndefined(options.tabs)) {
            this.setTabs(options.tabs);
        }
        if (!_.isUndefined(options.hoverMenu)) {
            this.hoverMenu = options.hoverMenu;
        }
        if (!_.isUndefined(options.loading)) {
            setLoading(options.loading);
        }

    },

    renderFade: function () {
        this.bindUIElements();
        this.ui.playergrid.fadeOut("fast");
        this.render();
        this.ui.playergrid.hide();
        this.ui.playergrid.fadeIn("fast");
    },

    renderGrid: function () {
        var formation = "1"+(this.model.get("formation") || "343"),
            grid = this.$(this.itemViewContainer),
            addEl = function (position) {
                var $el = $('<li></li>')
                    .addClass(position)
                    .attr("data-position", position);
                grid.append($el);
            };

        _.forEach(formation.split(""),
            function (val, idx) {
                var count = parseInt(val, 10),
                    position = ["Goalkeeper", "Defender", "Midfielder", "Forward"][idx];
                _.times(count, _.bind(addEl, this, position));
            }
        );
    },

    onRender: function () {
        this.renderGrid();
        this.setFormationClass();
        this.ui.playergrid.toggleClass('loading', this.loading);
        this.renderTabs();
        this.renderPlayersPosition();

        if (_.isObject(this.model.get("players"))) {
            this.closePitchInfo();
            this.model.get("players").each(this.renderPlayer, this);
        } else {
            this.showPitchInfo(GZ.helpers.i18n.gettext("Other teams are unavailable in the transfer window."));
        }

        if (this.model.get("matchday") > GZ.app.reqres.request("league:status:matchday")) {
            this.ui.futureTeamNotice.addClass("active");
        } else {
            this.ui.futureTeamNotice.removeClass("active");
        }
    },

    closePitchInfo: function () {
        this.$(this.itemViewContainer).removeClass('hide');
        this.ui.pitchInfo.addClass("hide");
        this.ui.pitchInfo.html("");
    },

    showPitchInfo: function (text) {
        this.$(this.itemViewContainer).addClass('hide');
        this.ui.pitchInfo.html(text);
        this.ui.pitchInfo.removeClass("hide");
    },

    renderPlayer: function (model) {
        var $container = this.$(this.itemViewContainer),
            itemView = new GZ.Views.PitchPlayer({
                model: model,
                hoverMenu: this.hoverMenu
            }),
            $el,
            $candidate = $container.find('li[data-playerid='+itemView.model.get("id")+']'),
            gridIndex;
        itemView.render();
        $el = $(itemView.el);
        if ($candidate.length === 0) {
            $candidate = $container.find('li:not(.player).'+itemView.model.get("position")).first();
        }
        gridIndex = $candidate.data('grid-index');
        if (!_.isUndefined(gridIndex)) {
            $el.data('grid-index', gridIndex);
            $el.addClass('player'+gridIndex);
        }
        $candidate.replaceWith($el);
    },

    setFormationClass: function () {
        var classesToRemove = _.filter(this.ui.playergrid[0].className.split(" "), function (cls) {
                return (cls.indexOf("formation-") !== -1);
            });

        this.ui.playergrid
            .removeClass(classesToRemove)
            .addClass("formation-"+this.model.get('formation'));
    },

    renderTabs: function () {
        this.ui.tabs.html('');
        _.each(this.tabs, function (t) {
            var el = $('<li>');
            el.html(t.title);
            el.toggleClass('active', t.selected);
            if (_.isFunction(t.action)) {
                el.click(t.action);
            }
            this.ui.tabs.append(el);
        }, this);
    },

    renderPlayersPosition: function () {
        var viewContainer = this.$(this.itemViewContainer);
        _.forEach(viewContainer.find('li'), function (li, i) {
            $(li).addClass('player'+(i+1));
            $(li).attr('data-grid-index', (i+1));
        }, this);
    },

    clickPlayer: function(event) {
        if (!$(event.currentTarget).hasClass('player')) {
            GZ.app.vent.trigger("pitch:buy", { "position": $(event.currentTarget).attr("data-position") });
        }
    },

    setTabs: function (tabs) {
        if (_.isUndefined(tabs)) {
            tabs = [];
        }
        this.tabs = tabs;
    },

    removeTabs: function () {
        this.tabs = [];
    },

    setLoading: function (loading, immediate) {
        // Convert to bool if not.
        this.loading = !!loading;
        if (!!immediate) {
            this.ui.playergrid.toggleClass('loading', this.loading);
        }
    }

});
