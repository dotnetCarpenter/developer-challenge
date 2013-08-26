GZ.Models.Plan = GZ.Models.TransactionModel.extend({

    urlRoot: GZ.Backend + '/users/me/subscriptions',

    // Cancels a plan.
    // Sends delete to the server, but triggers a refetch of the plan
    // instead of deleting it from the collection.
    cancel: function () {
        return this.destroy();
    },


    getOption: function (key, defaultValue) {
        return GZ.Models.Plan.getOption(this.get('plan_id'), key, defaultValue);
    },

    getTeamLimit: function () {
        return this.getOption('teamLimit', 0);
    },

    getLeagueLimit: function () {
        return this.getOption('leagueLimit', 0);
    },

    getUpgradePlans: function () {
        var plans = _.keys(GZ.Models.Plan.planOptions),
            start = 0;
        return plans.slice(_.indexOf(plans, this.get("plan_id"))+1);
    },

    trigger: function (verb) {
        // Do not pass along destroy events as plans are not destroyed in
        // the backbone sense, they are updated to be cancelled.
        if (verb !== "destroy") {
            GZ.Models.TransactionModel.prototype.trigger.apply(this, arguments);
        }
    }

}, {
    // XXX: Should be controlled from the backend as well so we don't have duplicate data.
    planOptions: {
        'basic': {
            teamLimit: 1,
            leagueLimit: 1,
            prices: {
                'dkk': 1900,
                'sek': 1900,
                'eur': 199
            }
        },
        'extra': {
            teamLimit: 3,
            leagueLimit: 1,
            prices: {
                'dkk': 2900,
                'sek': 2900,
                'eur': 299
            }
        },
        'ultimate': {
            teamLimit: Infinity,
            leagueLimit: Infinity,
            prices: {
                'dkk': 4900,
                'sek': 4900,
                'eur': 499
            }
        }
    },

    getOption: function (plan, key, defaultValue) {
        if (!_.isUndefined(this[plan]) && !_.isUndefined(this[plan][key])) {
            return this[plan][key];
        }
        return defaultValue;
    },

    getSatisfactoryPlans: function (requirements) {
        var plans = [];
        _.each(this.planOptions, function (options, key) {
            if (_.every(requirements, function (requiredValue, requirementKey) {
                return options[requirementKey] >= requiredValue;
            })) {
                plans.push(key);
            }
        }, this);
        return plans;
    }
});