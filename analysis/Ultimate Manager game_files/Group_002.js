GZ.Views.Group = Backbone.Marionette.CompositeView.extend(
    _.extend({}, GZ.Mixins.onVisible, {

        tagName: 'div',
        className: 'group-view',
        template: '#template-group-view',

        itemView: GZ.Views.GroupListItem,
        itemViewContainer: 'tbody',

        events: {
            'click .invite': 'invite',
            'click .join': 'join',
            'click .join-invited': 'joinInvited',
            'click .leave': 'leave',
            'click a[href=#accept]': 'accept',
            'click a[href=#decline]': 'decline'
        },

        modelEvents: {
            'change': 'render'
        },

        collectionEvents: {
            'all': 'collectionUpdated'
        },

        tableSorterOptions: {
            sortList: [
                [4,1],
                [3,1]
            ],
            sortInitialOrder: 'asc',
            sortRestart: true,
            headers: {
                0: { sortInitialOrder: 'desc' },
                3: { sortInitialOrder: 'desc' },
                4: { sortInitialOrder: 'desc' }
            },
            textExtraction: function(node) {
                var $node = $(node);
                return $node.data('value') || $node.text();
            }
        },

        wall: null,
        wallAppended: false,
        tableSetup: false,
        collectionLength: null, // Cache length

        initialize: function() {
            _.bindAll(this, 'registerDataUpdate');
            this.on('update', this.viewReInit, this);
            this.on('shown', this.viewShown, this);
            this.on('hid', this.viewHid, this);
        },

        itemViewOptions: function () {
            return {
                group_id: this.model.get('id')
            };
        },

        onCompositeModelRendered: function() {
            var wall_access = this.model.isMember() || !this.model.get('is_private');
            if (!this.wall && wall_access) {
                this.wall = new GZ.Views.GroupWall({
                    canPost: this.model.isMember(),
                    model: this.model,
                    collection: new GZ.Collections.Wallposts([], {
                        groupId: this.model.get('id')
                    })
                });
            } else if (this.wall && !wall_access) {
                this.wall.close();
                this.wall = null;
            }

            this.$('.scroll-container').customScroll({ observeHeight: false });
            this.$('table').tablesorter(this.tableSorterOptions);

            if (this.wall) {
                this.wall.options.canPost = this.model.isMember();
                this.$el.append(this.wall.render().el);
            }
        },

        onRender: function() {
            this.registerDataUpdate();
        },

        collectionUpdated: function() {
            this.renderCustomScroll();
            this.registerDataUpdate();
        },

        registerDataUpdate: _.debounce(function() {
            this.$('table').trigger('update');
        }, 500),

        renderCustomScroll: function() {
            if (this.collection.length != this.collectionLength) {
                this.$('.scroll-container').customScroll({ observeHeight: false });
                this.collectionLength = this.collection.length;
            }
        },

        invite: function(evt) {
            if (evt) evt.preventDefault();

            GZ.helpers.modal.open(new GZ.Views.Modals.Invite({
                model: this.model
            }));
        },

        join: function(evt) {
            if (evt) evt.preventDefault();

            this.model.join(GZ.Teams.getCurrent().id)
                .then(_.bind(function(){
                    if (this.wall) this.wall.collection.fetch();
                }, this));

            GZ.helpers.track.event("Groups", "Join");
        },

        joinInvited: function (evt) {
            evt.preventDefault();
            var view = new GZ.Views.GroupJoinInvitedPopover({
                collection: GZ.Teams
            });
            view.render();
            this.listenTo(view, 'joinGroup', function (team_id) {
                this.model.join(team_id)
                    .then(_.bind(function(){
                        if (this.wall) this.wall.collection.fetch();
                    }, this));
            }, this);

            $(evt.currentTarget).popover({
                html: true,
                placement: 'bottom',
                title: GZ.helpers.i18n.gettext('Pick team'),
                content: view.$el
            });
            $(evt.currentTarget).popover("show");

            GZ.helpers.track.event("Groups", "Join invited");
        },

        leave: function(evt) {
            if (evt) evt.preventDefault();

            if (!confirm(GZ.helpers.i18n.gettext('Leave group?'))) return;

            this.model.leave(GZ.Teams.getCurrent());

            GZ.helpers.track.event("Groups", "Leave");
        },

        accept: function(evt) {
            evt.preventDefault();
            var $target = $(evt.currentTarget),
                team_id = $target.parent().data('team-id'),
                user_id = $target.parent().data('user-id');

            if (!_.isUndefined(team_id)) {
                this.model.acceptRequest(user_id, team_id);
            }
        },

        decline: function(evt) {
            evt.preventDefault();
            var $target = $(evt.currentTarget),
                team_id = $target.parent().data('team-id'),
                user_id = $target.parent().data('user-id');

            if (!_.isUndefined(team_id)) {
                this.model.declineRequest(user_id, team_id);
            }
        },

        viewReInit: function(options) {
            if (this.wall) this.wall.collection.fetch();
            this.handleViewOptions(options);
        },

        viewShown: function(options) {
            GZ.app.vent.on('group:'+this.model.get('id')+':rankings', this.updateRankings, this);

            // Putting render here will save some rendering resources on the client machine
            this.render();
            if (this.wall) this.wall.collection.fetch();

            this.model.subscribe();

            this.handleViewOptions(options);
            this.detectVisibility();
        },

        onVisible: function() {
            this.$('table').fixedheader({
                container: this.$el
            });
        },

        handleViewOptions: function(options) {
            if (!_.isArray(options)) return;
            var actionName = options[0].charAt(0).toUpperCase() + options[0].slice(1);
            this['action'+actionName].apply(this, options.slice(1));
        },

        viewHid: function() {
            GZ.app.vent.off('group:'+this.model.get('id')+':rankings', this.updateRankings);

            this.model.unsubscribe();
        },

        updateRankings: function(data) {
            if (this.model.get('deleted')) return;
            this.collection.update(data.rankings);
            if (this.wall) {
                this.wall.setMentionMembers(data.rankings.map(function(item){
                    return {
                        id: item.manager_id,
                        name: item.name
                    };
                }));
            }
        },

        actionWall: function(postId) {
            this.wall.showWall(postId);
        }

    })
);