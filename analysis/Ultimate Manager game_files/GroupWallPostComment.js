GZ.Views.GroupWallPostComment = Backbone.Marionette.ItemView.extend({

    template: '#template-group-wall-post-comment',

    tagName: 'li',
    className: 'comment',

    events: {
        'click a[href=#delete_comment]': 'deleteComment'
    },

    deleteComment: function(evt) {
        evt.preventDefault();

        if (!confirm("Delete this comment?")) return;
        this.model.destroy();
    }

});