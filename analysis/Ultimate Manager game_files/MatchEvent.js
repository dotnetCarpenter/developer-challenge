GZ.Models.MatchEvent = GZ.RelationalModel.extend({

    idAttribute: 'event_id',

    set: function (key, val, options) {
        var attrs = {};
        if (_.isObject(key)) {
            attrs = key;
            options = val;
        } else {
            attrs[key] = val;
        }
        return GZ.RelationalModel.prototype.set.call(this, attrs, options);
    }

});