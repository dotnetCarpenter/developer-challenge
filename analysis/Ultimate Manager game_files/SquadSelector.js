GZ.Views.SquadSelector = Backbone.View.extend({

    template: "#squadselector_list",

	events: {
        "change select":           "filterPlayerlist",
        "click .pos input":        "updateSorters",
        'click .affordable input': 'toggleAffordablePlayers'
    },

    positions: {},
    showAllPositions: false,
    showOnlyAffordable: false,

    initialize: function() {
        _.bindAll(this);

        this.selector = this.$('select');
        this.filterPlayerlist = _.debounce(this.filterPlayerlist, 50);
        this.template = _.template( $(this.template).html() );
        this.resetPositions(true);

		_.delay(this.updateSquadList, 50);
		GZ.app.vent.on("pitch:buy", this.pitchBuy, this);
		GZ.app.vent.on("fixtures:selectedSquad", this.filterPlayerlist, this);

        this.collection.on('reset', this.collectionChanged, this);

        this.transferBalance = new GZ.Views.TransferBalance({
            el: this.$('.bank'),
            balance: this.model.bankBalance()
        });

        this.listenTo(this.model, "change:score", this.updateMoneyLimit, this);
        this.updateMoneyLimit();
    },

    collectionChanged: function() {
        this.updateSquadList();
        this.filterPlayerlist();
    },

    resetFilters: function () {
        this.resetPositions(true);
        this.moneyLimit = 0;
        this.$('.affordable input').attr('checked', false);
        this.updateSquadList();
        this.filterPlayerlist();
    },

    resetPositions: function(showAll) {
        this.showAllPositions = showAll;
        this.positions = {
            "Goalkeeper": false,
            "Defender": false,
            "Midfielder": false,
            "Forward": false
        };
        this.$(".pos input").attr("checked", false).change();
    },

    pitchBuy: function(data) {
        this.resetPositions(false);
        this.positions[ data.position ] = true;

        // Reset checkboxes and let event handling filter
        this.$('input[value="' + data.position + '"]').attr('checked', true).change();
        this.filterPlayerlist();

    },

    moneyChanged: function()
    {
        this.updateMoneyLimit();
        if (this.moneyLimit) {
            this.filterPlayerlist();
        }
    },

    toggleAffordablePlayers: function()
    {
        this.updateMoneyLimit();
        this.filterPlayerlist();
    },

    updateMoneyLimit: function() {
        var money = this.model.bankBalance();
        this.moneyLimit = this.$('.affordable input').attr('checked') ? Math.max(1, money) : 0;
        this.transferBalance.setBalance(money);
    },

    updateSorters: function(event) {
        var el = $(event.target);
        var position = el.val();
        if (position in this.positions)
        {
            if (this.$('.pos input:checked').length === 0)
            {
                this.showAllPositions = true;
            }
            else
            {
                this.showAllPositions = false;
            }

            this.positions[position] = el.is(":checked");
            this.filterPlayerlist();
        }
    },

    updateSquadList: function() {

        var squads = this.collection.map(function(squad){
            return { id: squad.get("id"), name: squad.get("name") };
        });
        var data = { squads: _.sortBy(squads, "name") };

        var out = this.template(data);

        this.selector.html( out );
        this.$("input").change();
        this.selector.trigger("change");
    },

    filterPlayerlist: function(squadId) {
        var filters = {},
            id,
            squad,
            players;

        if (typeof squadId === "number") {
            id = squadId;
            this.$("select").val(id);
        } else {
            id = this.$("select").val();
        }

        if (id !== "all") {
            filters.squad = id;
        }

        filters.positions = {};
        _.each(this.positions, function (value, key) {
            filters.positions[key] = this.showAllPositions || value;
        }, this);

        if (this.moneyLimit > 0) {
            filters.moneyLimit = this.moneyLimit;
        }

        GZ.app.vent.trigger("squadPlayers:filter", filters);

        this.selector.parent().find('span').html(
            this.selector.find('option:selected').html()
        );
    }

});