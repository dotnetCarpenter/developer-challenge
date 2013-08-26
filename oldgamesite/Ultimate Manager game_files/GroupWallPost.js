GZ.Views.GroupWallPost = Backbone.Marionette.CompositeView.extend({

    template: '#template-group-wall-post',

    tagName: 'li',
    className: 'post',

    ui: {
        addCommentLink: 'a[href=#comment]',
        addComment: '.add_comment',
        addCommentTextArea: 'textarea'
    },

    events: {
        'click a[href=#delete_post]': 'deletePost',
        'click a[href=#comment]': 'focusAddComment',
        'keypress textarea': 'checkForSubmitAction'
    },

    onRender: function() {
        var that = this;
        if (!this.options.canPost) {
            this.hideCommentingAbility();
        } else {
            this.ui.addComment[this.collection.length > 0 ? 'show' : 'hide']();
            this.ui.addCommentTextArea
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
        }
    },

    hideCommentingAbility: function() {
        this.ui.addCommentLink.hide();
        this.ui.addComment.hide();
    },

    deletePost: function(evt) {
        evt.preventDefault();

        if (!confirm("Delete this wall post?")) return;
        this.model.destroy();
    },

    focusAddComment: function(evt) {
        evt.preventDefault();

        this.ui.addComment.show();
        this.ui.addCommentTextArea.focus();
    },

    checkForSubmitAction: function(evt) {
        if (evt.keyCode == 13 && !evt.shiftKey) {
            this.submitComment();
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        }
    },

    submitComment: function() {
        var text = this.ui.addCommentTextArea.val(),
            mentions = [];

        this.ui.addCommentTextArea.mentionsInput('getMentions', function(data){
            mentions = _.pluck(data, 'id') || [];
        });

        if ($.trim(text).length < 1)
            return alert(GZ.helpers.i18n.gettext('Please type a comment'));

        this.collection.create({
            text: text,
            mentions: mentions
        }, { wait: true });

        this.ui.addCommentTextArea.mentionsInput('reset').blur().height(18);
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

    itemView: GZ.Views.GroupWallPostComment,
    itemViewContainer: 'ul.comments',

    // Expects an array of objects w/ syntax: {id:123,name:'Bo Stendal',type:'manager',nameLowercased:'bo stendal'}
    members: [],
    setMentionMembers: function(members) {
        this.members = members;
    }

});