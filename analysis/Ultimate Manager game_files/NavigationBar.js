GZ.Views.NavigationBar = Backbone.Marionette.ItemView.extend({

	tagName: 'ul',
	className: 'navigation-bar',
	template: '#template-navigation-bar',

	events: {
		'click li:not(.extra)': 'navigate'
	},

	initialize: function() {
		this.render();

		for (var i = 0; i < this.model.get('views').length; i++) {
			if (!this.model.get('views')[i].view.model) continue;
			this.model.get('views')[i].view.model.on('change', this.render, this);
		}
	},

	navigate: function(event) {
		var index = this.$('li:not(.extra)').index($(event.currentTarget));
		this.trigger('navigate', index);
		this.setActive(index);
	},

	setActive: function(index) {
		// Passing undefined to eq() reduces set to 0 elements
		if (index < 0) index = undefined;

		this.$('li:not(.extra)')
			.removeClass('active')
			.eq(index)
			.addClass('active');
	}

});