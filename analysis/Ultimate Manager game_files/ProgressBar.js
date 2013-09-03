GZ.Views.ProgressBar = Backbone.Marionette.CollectionView.extend({

    tagName: 'div',
    className: 'progress indicators',
    itemView: GZ.Views.ProgressBarItem,

    initialize: function () {
        this.collection.each(function (model, idx) {
            model.set('width', 100/this.collection.length);
        }, this);
        this.setCurrentItem(0);
    },

    setCurrentItem: function (index) {
        this.currentItem = this.collection.at(index);
        this.collection.each(function (model, idx) {
            model.set('solid', idx <= index);
        });
        this.render();
    }


});