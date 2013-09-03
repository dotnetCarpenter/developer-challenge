GZ.Collections.Players = GZ.Collection.extend({

	model: GZ.Models.Player,
	url: GZ.Backend + "/players",

    getByPosition: function(position) {
        return this.filter(function(player) {
            return player.get("position") === position;
        });
    }

});
