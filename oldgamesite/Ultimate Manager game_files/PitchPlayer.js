GZ.Views.PitchPlayer = Backbone.Marionette.ItemView.extend({

    template: "#pitchplayer",
    tagName: "li",

    events: {
        "click .action-set-captain": "setCaptain",
        "click .action-info": "showPlayer",
        "click .action-sell": "sellPlayer",
        "mouseenter": "mouseEnter",
        "mouseleave": "clearMenu"
    },

    ui: {
        actionMenu: '.action-menu',
        hoverMenu: '.hover-menu'
    },

    templateHelpers: {
        earnings: function () {
            var earnings = this.round_earnings;
            if (this.captain) {
                earnings *= 2;
            }
            return earnings;
        },
        isOnPitch: function () {
            var round = GZ.Leagues.getCurrent().getCurrentRound(),
                match;
            if (!_.isUndefined(this.pitchStatus) && _.indexOf(["starter", "sub_in"], this.pitchStatus.status) !== -1) {
                if (_.isUndefined(round)) {
                    return true;
                }
                match = round.get("matches").get(this.pitchStatus.match_id);
                return !_.isUndefined(match) && !match.get("finished");
            }
            return false;
        },
        isOrHasBeenOnPitch: function () {
            if (!_.isUndefined(this.pitchStatus) && _.indexOf(["starter", "sub_in", "sub_out", "sub_in_out", "red_card", "sub_in_red_card"], this.pitchStatus.status) !== -1) {
                return true;
            }
            return false;
        }
    },

    // Determines which button on the hoverMenu should be shown. (Defaults)
    hoverMenu: {
        captain: false,
        info: true,
        sell: false
    },

    initialize: function(options) {
        if (!_.isUndefined(options.hoverMenu)) {
            this.hoverMenu = options.hoverMenu;
        }
        if (!_.isUndefined(this.model)) {
            this.model.on("change", this.render, this);
        }
    },

    onBeforeRender: function () {
        this.$el.addClass( this.model.get("position") );
        this.$el.data("position", this.model.get("position") );

        if (this.model.has("id")) {
            var id = this.model.get("id");

            this.$el.addClass("player");
            this.$el.attr("data-playerid", id);

            // Add pitch player class, e.g. ARS or FUL
            this.$el.addClass(GZ.helpers.ui.pitchPlayerClass(this.model.get("id")));
        }

        if (this.model.has("pitchStatus") && this.model.get("pitchStatus").status == "not_present") {
            this.$el.toggleClass('inactive', true);
        } else {
            this.$el.toggleClass('inactive', false);
        }
    },

    mouseEnter: function (event) {
        clearTimeout(this.mouseEnterDelayTimer);
        this.mouseEnterDelayTimer = setTimeout(_.bind(function(){
            this.showMenu(event);
        }, this), 400);
    },

    renderHoverMenu: function () {
        var hoverMenu = '',
            icons = 0;
        if (this.hoverMenu !== false) {
            hoverMenu = $('<div class="hover-menu"></div>');
            if (this.hoverMenu.captain) {
                hoverMenu.append($('<a class="action-set-captain"><i class="icon-star"></i></a>'));
                icons++;
            }
            if (this.hoverMenu.info) {
                hoverMenu.append($('<a class="action-info"><i class="icon-info-sign"></i></a>'));
                icons++;
            }
            if (this.hoverMenu.sell) {
                hoverMenu.append($('<a class="action-sell"><i class="icon-trash"></i></a>'));
                icons++;
            }
            hoverMenu.addClass("icons-"+icons);
        }
        this.ui.actionMenu.
            html(hoverMenu);

        // Rebind ui elements for use in showMenu/clearMenu
        this.bindUIElements();
    },

    showMenu: function() {
        this.renderHoverMenu();
        this.ui.hoverMenu
            .css({
                opacity: 0,
                display: 'block',
                top: '8px'
            })
            .animate({
                duration: 'fast',
                opacity: 1,
                top: '2px'
            }, {
                queue: false
            });
    },

    clearMenu: function(event) {
        clearTimeout(this.mouseEnterDelayTimer);
        this.ui.hoverMenu
            .animate({
                duration: 'fast',
                opacity: 0,
                top: '-4px'
            }, {
                queue: false,
                complete: _.bind(function() {
                    this.ui.actionMenu.html("");
                }, this)
            });
    },

    showPlayer: function (event) {
        event.stopImmediatePropagation();
        var playerId = this.model.get("id");
        GZ.app.vent.trigger("showplayer", playerId);
    },

    setCaptain: function (event) {
        event.stopImmediatePropagation();
        GZ.app.vent.trigger("transfers:setcaptain", this.model.get("id"));
    },

    sellPlayer: function (event) {
        event.stopImmediatePropagation();

        var playerId = this.model.get("id");
        GZ.app.vent.trigger("transfers:sellplayer", playerId);
    }

});