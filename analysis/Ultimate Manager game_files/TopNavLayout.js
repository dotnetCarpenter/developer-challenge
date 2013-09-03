GZ.Views.TopNavLayout = Backbone.Marionette.Layout.extend({

    template: "#template-top-nav", // Template: top-nav.html
    className: "navbar-inner",

    ui: {
        mainMenu: ".top-nav-main-menu"
    },

    regions: {
        teamSelector: ".top-nav-team-selector",
        userMenu: ".top-nav-user-menu",
        countdown: ".top-nav-countdown"
    },

    events: {
        'click .top-nav-main-menu li a': 'onMainMenuClick'
    },

    _active: undefined,

    templateHelpers: function () {
        var mediapartner = "um";
        if (GZ.User.has("mediapartner")) {
            mediapartner = GZ.User.get("mediapartner");
        }
        return {
            mediapartner: mediapartner
        };
    },

    initialize: function (opt) {
        if (!_.isUndefined(opt.active)) {
            this._active = opt.active;
        }
    },

    onMainMenuClick: function (evt) {
        var $target = $(evt.currentTarget),
            url = $target.attr('href');
        evt.preventDefault();

        if (!$target.parent().hasClass('disabled')) {
            url = url.replace(Backbone.history.root, "");
            if (url !== "#") {
                GZ.router.navigate(url, { trigger: true });
            }
        }
    },

    onShow: function () {
        var teamSelectorView, userMenuView, countdownView;

        teamSelectorView = new GZ.Views.TeamSelector({
            collection: GZ.Teams,
            model: this.model
        });
        this.teamSelector.show(teamSelectorView);

        userMenuView = new GZ.Views.UserMenu({
            model: GZ.User
        });
        this.userMenu.show(userMenuView);

        countdownView = new GZ.Views.TopNavCountdown({
            model: GZ.Leagues.getCurrent().get('status')
        });
        this.countdown.show(countdownView);
    }

});