GZ.Views.Modals.Loader = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'loader',
    template: '#template-modals-loader',

    // Default values
    defaultData: {
        header: 'Loading',
        progress: 0,
        deterministic: false
    },

    initialize: function (options) {
        if (_.isUndefined(options)) options = {};
        if (_.isUndefined(options.data)) options.data = {};
        this.data = _.extend(this.defaultData, options.data);
    },

    serializeData: function () {
        return this.data;
    },

    set: function (key, value) {
        this.data[key] = value;
        this.render();
    },

    get: function (key) {
        return this.data[key];
    }

});