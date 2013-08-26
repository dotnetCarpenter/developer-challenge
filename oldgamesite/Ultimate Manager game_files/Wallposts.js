GZ.Collections.Wallposts = GZ.Collection.extend({

    model: GZ.Models.Wallpost,

    url: function() {
        if (!this.groupId) throw "Group ID must be specified to save or fetch wall posts";

        return [GZ.Backend, 'groups', this.groupId, 'wallposts'].join('/');
    },

    initialize: function(models, options) {
        _.extend(this, {}, options);
    },

    comparator: function(model) {
        return -model.get('id');
    }

});

GZ.Collections.WallpostComments = GZ.Collection.extend({

    model: GZ.Models.WallpostComment,

    url: function() {
        if (!this.groupId || !this.postId) throw "Group ID and Post ID must be specified to save or fetch wall post comment";

        return [GZ.Backend, 'groups', this.groupId, 'wallposts', this.postId, 'comments'].join('/');

    },

    comparator: function(model) {
        return model.get('id');
    }

});