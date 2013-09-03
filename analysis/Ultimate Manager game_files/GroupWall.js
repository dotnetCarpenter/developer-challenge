GZ.Views.GroupWall = Backbone.Marionette.CompositeView.extend({

    template: '#template-group-wall',

    tagName: 'div',
    className: 'wall',

    ui: {
        postsContainer: '.wall-posts',
        newPostContainer: '.new-post',
        newPostButton: '.new-post button.post',
        newPostTextArea: '.new-post textarea'
    },

    events: {
        'click .toggle': 'toggleWall',
        'focus .new-post textarea': 'newPostFocus',
        'blur .new-post textarea': 'newPostBlur',
        'click button.post': 'submitPost'
    },

    showWall: function(postId) {
        this.$el.addClass('visible');
        if (!_.isUndefined(postId)) {
            var $post = this.$('li.post>div[data-post-id='+postId+']'),
                doScroll = _.bind(function(){
                    this.ui.postsContainer.scrollTop($post.offset().top);
                }, this);

            if ($post.length === 0) {
                this.once('render', function(){
                    $post = this.$('li.post>div[data-post-id='+postId+']');
                    doScroll();
                }, this);
            } else {
                _.delay(doScroll, 100);
            }
        }
    },

    toggleWall: function(evt) {
        var fragment = Backbone.history.getFragment().split('/');

        evt.preventDefault();

        if (this.$el.hasClass('visible')) {
            fragment.pop();
        } else {
            fragment.push("wall");
        }

        this.$el.toggleClass('visible');

        GZ.router.navigate(fragment.join("/"), { trigger: false });
    },

    newPostFocus: function(evt) {
        this.ui.newPostButton.show();
    },

    newPostBlur: function(evt) {
        if ($.trim(this.ui.newPostTextArea.val())) return;
        this.ui.newPostButton.hide();
    },

    submitPost: function(evt) {
        evt.preventDefault();

        var text = this.ui.newPostTextArea.val(),
            mentions = [];

        this.ui.newPostTextArea.mentionsInput('getMentions', function(data){
            mentions = _.pluck(data, 'id') || [];
        });

        if ($.trim(text).length < 1)
            return alert(GZ.helpers.i18n.gettext('Please write a comment'));

        this.collection.create({
            text: text,
            mentions: mentions
        }, { wait: true });

        this.ui.newPostTextArea.mentionsInput('reset').blur().height(18);
    },

    onRender: function() {
        var that = this;
        this.delegateEvents();
        if (this.options.canPost) {
            this.ui.newPostTextArea
                .mentionsInput({
                    onDataRequest: function(mode, query, callback) {
                        var queryLowercased = query.toLowerCase();

                        data = _.filter(that.members, function(item) {
                            return item.nameLowercased.indexOf(queryLowercased) > -1;
                        });

                        callback.call(this, data);
                    },
                    elastic: false,
                    showAvatars: false
                })
                .autogrow({ animate: false });
        } else {
            this.ui.newPostContainer.hide();
        }
    },

    appendHtml: function(collectionView, itemView) {
        var index = collectionView.collection.indexOf(itemView.model),
            action,
            $container = this.getItemViewContainer(collectionView);

        if (index <= 0) action = 'prepend';
        else if (index > $container.children().length - 1) action = 'append';

        if (action) $container[action](itemView.el);
        else $container.children().eq(index - 1).after(itemView.el);
    },

    itemView: GZ.Views.GroupWallPost,
    itemViewContainer: 'ul.posts',

    itemViewOptions: function(model) {
        var comments = new GZ.Collections.WallpostComments(model.get('comments'));
        comments.groupId = model.get('group_id');
        comments.postId = model.get('id');

        return {
            collection: comments,
            canPost: this.options.canPost
        };
    },

    onAfterItemAdded: function(view) {
        if (!_.isFunction(view.setMentionMembers)) return; // emptyView
        view.setMentionMembers(this.members);
    },

    emptyView: GZ.Views.GroupWallNoPosts,

    showEmptyView: function(){
        var EmptyView = Marionette.getOption(this, "emptyView");

        if (EmptyView && !this._showingEmptyView) {
            this._showingEmptyView = true;
            this.addItemView(this.model, EmptyView, 0);
        }
    },

    // Expects an array of objects w/ syntax: {id:123,name:'Bo Stendal'}
    members: [],
    setMentionMembers: function(members) {
        this.members = members.map(function(item){
            item.nameLowercased = item.name.toLowerCase();
            item.type = 'manager';
            return item;
        });
    }

});