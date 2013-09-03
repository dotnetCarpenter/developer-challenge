/*
* Dynamic Table View with support for pagination
* ----------- Expects to be extended -----------
*
* EXAMPLE
* var MyPaginatedTableView = PaginatedTableView.extend({
*     paginationView: MyPaginationView,
*     generatePagination: true,
*     pageLimit: 2
* });
* var tvModel = new Backbone.Model({
*     columns: [{ key: 'name', title: 'Name' }] //
* });
* var tvItems = new Backbone.Collection([
*     { name: 'John Johnson', age: 28 },
*     { name: 'Casper the Ghost', age: 12 },
*     { name: 'Jony Appleseed', age: 16 },
*     { name: 'Timothy Cook', age: 8 }
* ]);
* var tableView = new MyPaginatedTableView({
*     model: tvModel,
*     collection: tvItems
* });
*/

GZ.Views.PaginatedTableView = Backbone.Marionette.CompositeView.extend({

    // Integer value for how many items to show per page
    pageLimit: 10,
    // PaginationView will receive a collection with one attribute 'page', an
    // integer value. Triggering 'changePage' event from PaginationView will
    // change page.
    paginationView: null,

    events: {
        // For sorting to work properly, set data-key attribute on <th>,
        // which related to the attribute of the collection model, which value
        // to sort on
        'click thead th': 'sortColumn'
    },

    currentPage: 1,

    constructor: function(options) {
        this.collection = new Backbone.Collection([]);
        this.entireCollection = options.entireCollection;
        this.listenTo(this, "render", this.renderPagination, this);
        Backbone.Marionette.CompositeView.prototype.constructor.apply(this, arguments);
    },

    _initialEvents: function(){
        this.listenTo(this.entireCollection, "add", this.updateCollection, this);
        this.listenTo(this.entireCollection, "remove", this.updateCollection, this);
        this.listenTo(this.entireCollection, "reset", this.updateCollection, this);
        this.listenTo(this.entireCollection, "sort", this.updateCollection, this);

        Backbone.Marionette.CompositeView.prototype._initialEvents.apply(this, arguments);
    },

    renderPagination: function() {
        try {
            this.getPaginationView();
            this.generatePagination();
        } catch(e) {}
    },

    calculateOffset: function(page) {
        return (page - 1) * this.pageLimit;
    },

    updateCollection: function() {
        this.setCollection(this.calculateOffset(this.currentPage), this.pageLimit);
        this.generatePagination();
    },

    setCollection: function(offset, limit) {
        this.collection.reset(this.entireCollection.slice(offset, limit+offset));
    },

    itemViewOptions: function() {
        return {
            columns: this.model.get('columns')
        };
    },

    sortColumn: function(e) {
        this.currentPage = 1;
        this.entireCollection.setComparator($(e.currentTarget).data('key'));

        this.$('thead th').removeClass('tablesorter-headerAsc tablesorter-headerDesc');

        var sortClass = 'tablesorter-header' + (this.entireCollection.desc ? 'Desc' : 'Asc');
        $(e.currentTarget).addClass(sortClass);
    },

    generatePagination: function() {
        var PaginationView = this.getPaginationView();

        if (!this.pagination && PaginationView) {
            this.pagination = new PaginationView();
            this.pagination.collection = new Backbone.Collection(this.getPageCollection());
            this.pagination.on('changePage', this.changePage, this);
        } else {
            this.pagination.collection.reset(this.getPageCollection());
        }

        this.$el.append(this.pagination.render().el);
    },

    getPageCollection: function() {
        var self = this,
            pageCount = Math.ceil(this.entireCollection.length/this.pageLimit),
            selectablePages = _.range(
                Math.max(1, this.currentPage-5),
                Math.min(pageCount, this.currentPage+5)
            );

        if (_.indexOf(selectablePages, 2) == -1) {
            selectablePages.unshift('...');
        }
        if (_.indexOf(selectablePages, 1) == -1) {
            selectablePages.unshift(1);
        }
        if (_.indexOf(selectablePages, pageCount-1) == -1) {
            selectablePages.push('...');
        }
        if (_.indexOf(selectablePages, pageCount) == -1) {
            selectablePages.push(pageCount);
        }

        return selectablePages.map(function(value){
            if (value == '...') return {};
            return { page: value, active: (self.currentPage == value) };
        });
    },

    getPaginationView: function(required) {
        var paginationView = Marionette.getOption(this, 'paginationView');

        if (!paginationView && required === true) {
            var err = new Error("A 'paginationView' must be specificed when generatePagination is not disabled");
            err.name = 'NoPaginationViewError';
            throw err;
        }

        return paginationView;
    },

    changePage: function(page) {
        this.currentPage = page;
        this.updateCollection();
    }

});