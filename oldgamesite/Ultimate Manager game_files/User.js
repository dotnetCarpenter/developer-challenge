GZ.Models.User = GZ.RelationalModel.extend(_.extend({}, GZ.ModelValidation, {

    urlRoot: GZ.Backend + "/users",

    relations: [
        {
            type: Backbone.HasOne,
            key: 'credit_card',
            relatedModel: 'GZ.Models.CreditCard'
        },
        {
            type: Backbone.HasMany,
            key: 'paymentplans',
            relatedModel: 'GZ.Models.Plan',
            collectionType: 'GZ.Collections.Plans'
        }
    ],

    defaults: {
        "email": "",
        "name": "",
        "score": {
            "money": 0,
            "team_value": 0,
            "earnings": 0,
            "experience": 0
        }
    },

    errorMessages: {
        "name": {
            'MISSINGKEY': GZ.helpers.i18n.none_gettext("The name cannot be empty."),
            'TOO_SHORT': GZ.helpers.i18n.none_gettext("The name is too short.")
        },
        "email": {
            'MISSINGKEY': GZ.helpers.i18n.none_gettext("The email cannot be empty."),
            'INVALID': GZ.helpers.i18n.none_gettext("The email is not valid."),
            'EMAIL_ALREADY_EXISTS': GZ.helpers.i18n.none_gettext("A user with this email already exists.")
        },
        "password": {
            'MISSINGKEY': GZ.helpers.i18n.none_gettext("The password cannot be empty."),
            'CANNOT_BE_EMPTY': GZ.helpers.i18n.none_gettext("The password cannot be empty."),
            'TOO_SHORT': GZ.helpers.i18n.none_gettext("The password is too short.")
        }
    },

    jsonFilters: {
        create: ["name", "email", "password", "location", "birthday",
                 "favourite_team", "language", "picture"],
        update: ["name", "email", "password", "location", "birthday",
                 "favourite_team", "language", "picture"]
    },

    validations: {
        "name": [
            {
                validator: "length",
                msg: GZ.helpers.i18n.none_gettext("The name cannot be empty.")
            },
            {
                validator: function (val) { return (val.length >= 5); },
                msg: GZ.helpers.i18n.none_gettext("Your name must be at least 5 characters long.")
            }
        ],
        "email": [
            {
                validator: "length",
                msg: GZ.helpers.i18n.none_gettext("The email cannot be empty.")
            },
            {
                validator: "email",
                msg: GZ.helpers.i18n.none_gettext("The email entered is not valid.")
            }

        ],
        "password": [
            {
                validator: "length",
                msg: GZ.helpers.i18n.none_gettext("The password cannot be empty.")
            },
            {
                validator: function (val) { return (val.length >= 8); },
                msg: GZ.helpers.i18n.none_gettext("Your password must be at least 8 characters long")
            }
        ]
    },

    incr: function(prop, val) {
        if (!val) {
            return;
        }

        var score = this.get("score");

        if (!score.hasOwnProperty(prop)) {
            return;
        }

        score[prop] += val;

        this.trigger("change:score");
    },

    align: function(prop, val) {
        var score = this.get("score");

        if (!score.hasOwnProperty(prop)) {
            return;
        }

        score[prop] = val;

        this.trigger("change:score");
    },

    getCurrency: function() {
        switch (this.get('language')) {
            case 'da_DK':
                return 'dkk';
            case 'en_US':
                return 'gbp';
            default:
                return 'eur';
        }
    },

    login: function (email, password) {
        var options = {
                username: email,
                password: password,
                _ajax: true
            },
            cb = _.bind(function () {
                this.fetch();
            }, this);
        return $.post('/api/login', options, cb);
    },

    canEdit: function () {
        // For the moment a user can only edit the own user
        return this == GZ.User;
    },

    canCreateExtraTeam: function (new_team) {
        if (this.has('paymentplans') && this.get('paymentplans').length > 0) {
            var activePlan = this.get('paymentplans').getActive();
            if (!_.isUndefined(activePlan)) {
                return _.contains(this.getSatisfactoryPlans(new_team), activePlan.get('plan_id'));
            }
        }
        return false;
    },

    getSatisfactoryPlans: function (new_team) {
        var leagues_count = _.unique(GZ.Teams.pluck("league_id").concat(new_team.get("league_id"))).length;
        return GZ.Models.Plan.getSatisfactoryPlans({
            teamLimit: GZ.Teams.length+1,
            leagueLimit: leagues_count
        });
    },

    facebookLogin: function () {
        return GZ.helpers.facebook.login({'scope': 'email'})
            .pipe(function (facebookAuthResponse) {
                return $.post('/api/login/facebook', "token="+facebookAuthResponse.accessToken, 'json');
            })
            .pipe(_.bind(function () {
                return this.fetch();
            }, this));
    }

}));