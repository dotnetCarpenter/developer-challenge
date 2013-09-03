GZ.Collections.NavigationItems = Backbone.Collection.extend({

	model: GZ.Model.NavigationItem,

	fetch: function()
	{
		for (var i = 0, n = this.length, model; i < n; i++)
		{
			this.at(i).fetch();
		}

		return this;
	}

});