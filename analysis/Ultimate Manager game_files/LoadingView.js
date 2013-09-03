GZ.Mixins.LoadingView = {

    isLoading: false,

    addChildView: function() {
        this.closeLoadingView();
        Backbone.Marionette.CompositeView.prototype.addChildView.apply(this, arguments);
    },

    render: function() {
        this.closeLoadingView();
        Backbone.Marionette.CompositeView.prototype.render.apply(this, arguments);
    },

    // Overwrite on renderCollection method to check for
    // empty collection and loading flag
    renderCollection: function() {
        if (this.isLoading && this.collection.length === 0) {
            this.triggerBeforeRender();
            this.showLoadingView();
            this.triggerRendered();
            this.triggerMethod("composite:collection:rendered");
            return;
        }

        Backbone.Marionette.CompositeView.prototype.renderCollection.apply(this, arguments);
    },

    // Internal method to show a loading view in place of
    // a collection of item views, when the collection is
    // empty
    showLoadingView: function(){
        var LoadingView = Marionette.getOption(this, "loadingView");

        if (!LoadingView) return false;
        if (LoadingView && !this._showingLoadingView){
            this._showingLoadingView = true;
            var model = new Backbone.Model();
            this.addItemView(model, LoadingView, 0);
        }
        return true;
    },

    // Internal method to close an existing LoadingView instance
    // if one exists. Called when a collection view has been
    // rendered empty, and then an item is added to the collection.
    closeLoadingView: function(){
        if (this._showingLoadingView){
            this.closeChildren();
            delete this._showingLoadingView;
        }
    }

};