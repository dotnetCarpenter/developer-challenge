GZ.Models.Squad = GZ.RelationalModel.extend({
	urlRoot: GZ.Backend + "/squads",

	relations: [
		{
			type: Backbone.HasMany,
			key: "players",
			relatedModel: GZ.Models.Player,
			collectionType: GZ.Collections.Players,
			reverseRelation: {
                key: "squad",
                includeInJSON: false
			}
		}
	]

});

