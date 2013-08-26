GZ.Mixins.onVisible = {

    _visibleInterval: null,

    detectVisibility: function() {
        if (_.isNull(this._visibleInterval)) {
            this._visibleInterval = setInterval(_.bind(this.checkVisibility, this), 100);
        }
    },

    checkVisibility: function() {
        if (this.$el.is(':visible')) {
            if (_.isFunction(this.onVisible)) {
                this.onVisible();
            }
            clearInterval(this._visibleInterval);
            this._visibleInterval = null;
        }
    },

    onVisible: function(){} // placeholder

};