GZ.Views.PlayerBioTransferStatRow = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'row',
    template: '#template-player-bio-transfer-stat-row',
    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this, arguments);

        data.thirdStat = this.options.thirdStat;

        return data;
    }

});