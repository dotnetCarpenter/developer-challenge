GZ.Collections.Plans = GZ.Collection.extend({

    url: GZ.Backend + '/users/me/subscriptions',

    inTrial: function() {
        var active = this.getActive();
        if (active && active.get('plan') == 'trial' && !this.getPending()) {
            return true; // Trial, no plan selected
        }
        return false;
    },

    hasPremiumPlan: function () {
        var active = this.getActive();
        if (!_.isUndefined(active) && active.get('plan') != 'trial') {
            return true;
        }
        return false;
    },

    hasCancelledPremiumPlan: function () {
        var plan = this.find(function(item){
            return item.get('status') == 'Canceled' &&
                    (item.get('expiration_date') === null ||
                     item.get('expiration_date') > new Date().getTime());
        });
        return !_.isUndefined(plan);
    },

    hasPending: function () {
        return !!this.getPending();
    },

    getActive: function() {
        return this.find(function(item){
            return item.get('status') == 'Active';
        });
    },

    getPending: function() {
        return this.find(function(item){
            return item.get('status') == 'Pending';
        });
    }

});

// Constants
GZ.Collections.Plans.K = {
    plans: ['monthly', 'season']
};