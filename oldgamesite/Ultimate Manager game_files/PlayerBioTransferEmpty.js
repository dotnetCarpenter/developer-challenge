GZ.Views.PlayerBioTransferEmpty = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'empty-row',
    template: '#template-player-bio-transfer-empty'

});

GZ.Views.PlayerBioTransferLoading = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'loading-row',
    template: '#template-player-bio-transfer-loading'

});