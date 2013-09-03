GZ.Views.SquadPlayers = Backbone.View.extend({
    el: "#squadlist",
    table: "table:first",
    tbody: "#squadlisttablebody",
    template: "#squadselector_player",

	events: {
        "click .buy":     "buyPlayer",
        "click tbody tr": "showPlayer"
	},

    sorterOptions: {
        sortList: [
            [4,1]
        ],
        headers: {
            0: { sorter: "text" },
            1: { sorter: "text", sortInitialOrder: 'asc' },
            2: { sorter: "text", sortInitialOrder: 'asc' },
            3: { sorter: "position", sortInitialOrder: 'asc' },
            4: { sorter: "digit" },
            5: {
                sorter: "digit", string: "min"
            },
            6: {
                sorter: "digit", string: "min"
            },
            7: { sorter: "digit" },
            8: { sorter: "digit" },
            9: {
                sorter: "digit", string: "min"
            },
            10: { sorter: "percent" },
            11: { sorter: "digit" }
        },
        textExtraction: {
            0: function(node, table, cellIndex) { return $(node).data('value'); },
            1: function(node, table, cellIndex) { return $(node).data('value'); },
            2: function(node, table, cellIndex) { return $(node).data('value'); },
            3: function(node, table, cellIndex) { return $(node).data('value'); },
            4: function(node, table, cellIndex) { return $(node).data('value'); },
            5: function(node, table, cellIndex) { return $(node).data('value'); },
            6: function(node, table, cellIndex) { return $(node).data('value'); },
            7: function(node, table, cellIndex) { return $(node).data('value'); },
            8: function(node, table, cellIndex) { return $(node).data('value'); },
            9: function(node, table, cellIndex) { return $(node).data('value'); },
            10: function(node, table, cellIndex) { return $(node).data('value'); },
            11: function(node, table, cellIndex) { return $(node).data('value'); }
        },
        sortInitialOrder: 'desc',
        sortRestart: true
    },

	initialize: function(options) {
        _.bindAll(this);

        if (!_.isUndefined(options.transferDisabled)) {
            this.transferDisabled = options.transferDisabled;
        }

        this.$('.table-container').customScroll({ observeHeight: false });
        this.template = _.template( $(this.template).html() );

        this.$(this.table)
            .tablesorter(this.sorterOptions)
            .fixedheader({
                offset: {
                    left: '8px',
                    top: '8px'
                },
                calculateOffset: false,
                container: this.$el
            });

        GZ.app.vent.on("squadPlayers:filter", this.filterPlayerList, this);
        GZ.app.vent.on("model:player", this.updatePlayer, this);
	},

    filterPlayerList: function (filters) {
        var players = [],
            squad;

        if (filters.squad) {
            squad = this.collection.get(filters.squad);
            if (!squad) return;

            players = squad.get("players").toJSON();
        } else {
            players = this.collection.getAllPlayers();
        }

        players = _.filter(players, function (player) {
            if (filters.moneyLimit > 0 && player.value > filters.moneyLimit) return false;
            return filters.positions[ player.position ] === true;
        });

        this.renderTable(players);
    },

    renderTable: function( players ) {
        var out = _.map(players, this.template).join('');

        this.$(this.tbody).html(out);

        this.$(this.tbody).find('tr')
            .toggleClass('transferDisabled', this.transferDisabled);

        this.$(this.table).trigger("update");
        this.$('.table-container').customScroll({ observeHeight: false });
	},

    scrollToTop: function()
    {
        this.$('.table-container').scrollTop(0);
    },

	buyPlayer: function(event) {
        event.stopPropagation();
        var playerId = "" + $(event.target).closest("tr").data("playerid");

        GZ.app.vent.trigger("transfers:buyplayer", playerId);
	},

    showPlayer: function(event) {
        event.stopPropagation();
        var playerId = $(event.target).closest("tr").data("playerid");

        if (playerId) {
            GZ.app.vent.trigger("showplayer", ""+playerId);
        }
    },

    updatePlayer: function(event) {
        // XXX: Refactor, this would be handled automatically if each row was an ItemView

        var cell = this.$(this.tbody).find('tr[data-playerid="' + event.player_id + '"] td:nth-child(5)');

        if (cell.length === 0) {
            return;
        }

        var value = GZ.helpers.ui.formatEarnings(event.score);
        cell.text(value);
    }

});