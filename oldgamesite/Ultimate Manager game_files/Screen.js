GZ.Views.Screen = Backbone.Marionette.Layout.extend({

    constructor: function () {
        var args = Array.prototype.slice.apply(arguments);
        this.t3ContentArea = new GZ.Views.SimpleContentArea();
        Backbone.Marionette.Layout.prototype.constructor.apply(this, args);
    },


    setT3Data: function (key, data) {
        this.t3data[key] = data;
    },

    isCurrentScreen: function() {
        return true;
    }

});
