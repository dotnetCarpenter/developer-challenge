GZ.Views.GroupsList = Backbone.Marionette.CompositeView.extend(
    _.extend({}, GZ.Mixins.onVisible, {

        template: '#template-groups-list',
        tagName: 'div',
        className: 'groups-list',

        itemView: GZ.Views.GroupsListItem,
        itemViewContainer: 'tbody',

        ui: {
            nameFilter: 'input[name="name_filter"]'
        },

        events: {
            'keyup input[name="name_filter"]': 'filterGroups'
        },

        tableSorterOptions: {
            sortInitialOrder: 'asc',
            sortRestart: true,
            headers: {
                1: { sortInitialOrder: 'desc' }
            }
        },

        initialize: function() {
            this.on('shown', this.viewShown, this);
            this.on('hid', this.viewHid, this);
        },

        onCompositeModelRendered: function() {
            this.$('table').tablesorter(this.tableSorterOptions);
        },

        onRender: function() {
            var self = this;
            _.defer(function(){
                self.$('.scroll-container').customScroll({ observeHeight: false });
                self.$('table').trigger('update');
            });
        },

        viewShown: function() {
            this.collection.fetch();
            // Putting render here will save some rendering resources on the client machine
            this.render();
            this.detectVisibility();
        },

        onVisible: function() {
            this.$('table').fixedheader({ container: this.$el });
        },

        viewHid: function() {
        },

        filterGroups: function() {
            var filterValue = this.ui.nameFilter.val().toLowerCase();

            this.children.each(function(view){
                var name = view.$el.attr('data-name').toLowerCase(),
                    showMethod = name.indexOf(filterValue) > -1 ? 'show' : 'hide',
                    classMethod = showMethod == 'show' ? 'remove' : 'add';
                view.$el[showMethod]()[classMethod+'Class']('hidden');
            });
        }

    })
);