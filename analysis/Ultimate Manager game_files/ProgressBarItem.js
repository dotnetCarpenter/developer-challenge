GZ.Views.ProgressBarItem = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'bar',
    template: '#template-progress-bar-item',

    onRender: function () {
        this.$el.toggleClass('bar-transparent', !this.model.get('solid'));
        this.$el.css('width', this.model.get("width")+"%");
    }


});