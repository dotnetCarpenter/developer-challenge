GZ.Collections.SortableTableCollection = GZ.Collection.extend({

    setComparator: function(key, options) {
        desc = key == this.comparatorKey ? !this.desc : true;
        options = _.extend({ sort: true, desc: desc }, options);
        this.comparatorKey = key;
        this.desc = options.desc;
        if (options.sort) this.sort();
    },

    alphabet: '*!@_.()#^&%-=+01234567989aàáâãābcçćčdðeèéêëēėęfghiîïíīįìjklłmnñńoôòóœōõpqrsśšßtuûüùúūvwxyþzæäøöå',

    comparator: function(modelA, modelB) {
        var a = this.getComparatorValue(modelA),
            b = this.getComparatorValue(modelB),
            multiplier = this.desc ? -1 : 1;

        if (!_.isString(a) || !_.isString(b)) {
            if (a == b) return 0;
            return (a < b ? -1 : 1) * multiplier;
        }

        var index_a = this.alphabet.indexOf(a[0]),
            index_b = this.alphabet.indexOf(b[0]);

        if (index_a === index_b) {
            if (a == b) return 0;
            return (a < b ? -1 : 1) * multiplier;
        }

        return (index_a - index_b) * multiplier;
    },

    getComparatorValue: function(model) {
        var value;
        if (_.isUndefined(this.comparatorKey)) {
            value = _.toArray(model.attributes)[0];
        } else {
            var keyParts = this.comparatorKey.split('.');
            value = model.attributes;

            while (keyParts.length > 0) {
                value = value[keyParts.shift()];
            }
        }

        if (_.isString(value)) return $.trim(value).toLowerCase();
        return value;
    },

    reverseStringComparator: function(str) {
        return String.fromCharCode.apply(String,
            _.map(str.split(''), function(c){
                return 0xffff - c.charCodeAt();
            })
        );
    }

});