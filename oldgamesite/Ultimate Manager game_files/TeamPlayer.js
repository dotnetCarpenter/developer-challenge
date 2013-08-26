/*
 * A TeamPlayer is a hack to add additional properties to a player 
 * that is not stored in the relational store.
 */
GZ.Models.TeamPlayer = GZ.RelationalModel.extend({

    urlRoot: GZ.Backend + "/player",

    relations: [
        {
            type: Backbone.HasOne,
            key: "player",
            includeInJSON: Backbone.Model.prototype.idAttribute,
            relatedModel: GZ.Models.Player
        }
    ],

    initialize: function (options) {
        if (this.has("player")) {
            this.get("player").on("change", function () {
                // Make sure we bypass the backbone-relational change trigger 
                // as it silences our change event!%&!
                Backbone.Model.prototype.trigger.call(this, "change", this);
            }, this);
        }
    },

    toJSON: function () {
        var json = {
            captain: this.get("captain"),
            pitchStatus: this.get("pitchStatus")
        };
        if (this.has("player")) {
            json = _.extend(json, this.get("player").toJSON());
        }
        return json;
    },

    get: function (key) {
        var player,
            value = GZ.RelationalModel.prototype.get.apply(this, arguments);
        // Fetch attribute in player reference if not found in local properties.
        if (_.isUndefined(value) && !_.isUndefined(this.attributes.player) && !_.isNull(this.attributes.player)) {
            value = this.attributes.player.get(key);
        }
        return value;
    }
});