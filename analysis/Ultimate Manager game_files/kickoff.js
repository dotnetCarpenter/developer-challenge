(function GZMain(window, GZ, Backbone, undefined) {
    var leagueSquadsFetchDeferred,
        app = GZ.app;

	// Core app
	app.on('initialize:before', onBeforeInitApp);
    app.addInitializer(initApp);
    app.on("initialize:after", onInitApp);

    function onBeforeInitApp() {

    }

    function initApp() {
        this.addRegions({
            "topNavArea":   ".top-nav",
            "mainArea":     "#maincontent"
        });
        GZ.appController = new GZ.AppController();
        GZ.router = new GZ.AppRouter({
            controller: GZ.appController
        });
    }

    function onInitApp() {
        // showExpiryModal();
        showAnnouncementsModal();
        startHistory();
        showEnvironmentBanner();
    }

    function startHistory() {
        var options = {
            pushState: "pushState" in window.history,
            root: "/game/"
        };

        if (Backbone.history) {
            Backbone.history.start(options);
        }
    }

    function showEnvironmentBanner() {
        var subdomain = location.hostname.replace('.ultimatemanager.com', '');
        if (_.indexOf(['local','beta','dev'], subdomain) > -1)
        {
            $('#notice_bar')
                .html(new Array(20).join(
                    subdomain.toUpperCase().split('').join('<br>')+'<br><br>'
                ))
                .show();
        }
    }

    function showExpiryModal() {
        // Do not show in first xp
        if (GZ.User.isNew()) return;

        // Do not show if we have a pending plan
        if (GZ.User.get('paymentplans').hasPending()) return;

        // Do not show if user has an active plan
        if (GZ.User.get('paymentplans').hasPremiumPlan()) return;

        // Do not show if user has a cancelled premium plan
        if (GZ.User.get('paymentplans').hasCancelledPremiumPlan()) return;

        // Do not show if we're in trial and has a cookie set.
        if (GZ.User.get('paymentplans').inTrial() && !_.isNull(GZ.helpers.cookie.read('avoid_subexp_modal'))) return;

        var model = new GZ.Models.SubscriptionExpired({ paymentplans: GZ.User.get('paymentplans') });
        GZ.helpers.modal.open(new GZ.Views.Modals.SubscriptionExpired({
            model: model
        }), { close: model.get('days_left') > 0 });

        // Set cookie to avoid having the SubExp modal to pop up more than once per day, when in trial
        if (GZ.User.get('paymentplans').inTrial()) {
            var midnight = new Date(),
                delta = midnight.getTime();

            midnight.setHours(24, 0, 0, 0);

            var days_until_midnight = (midnight.getTime() - delta) / 84000000;

            GZ.helpers.cookie.create('avoid_subexp_modal', 1, days_until_midnight);
        }
    }

    function showAnnouncementsModal() {
        var locale = GZ.helpers.i18n.getLocale(),
            announcement = "";
        if (GZ.Announcements && !_.isUndefined(GZ.Announcements[locale])) {
            announcement = GZ.Announcements[locale];
            GZ.helpers.modal.open(new GZ.Views.Modals.Announcement({
                'announcement': announcement
            }), {className: 'announcement'});
        }
    }

    (function($){
        var blinkSpeed = 100;

        $.fn.blink = function() {
            var that = this;
            this.animate({opacity: 0.5}, {
                duration: blinkSpeed,
                complete: function(){
                    that.animate({opacity: 1}, blinkSpeed);
                }
            });
        };

        // Use 1,234,567m89 number format for digits, by default
        _.extend($.tablesorter.defaults, {
            usNumberFormat: true,
            widthFixed: false
        });
        $.tablesorter.addParser({
                id: 'position',

                is: function(s) {
                    // return false so this parser is not auto detected
                    return false;
                },

                format: function(s) {
                    // format your data for normalization
                    return s.toLowerCase().replace(/att/,3).replace(/mid/,2).replace(/def/,1).replace(/goa/,0);
                },
                // set type, either numeric or text
                type: 'numeric'
            });

        $.fixedheader.defaults.container = $("#maincontent");

        // Setting up x-editable
        $.fn.editable.defaults.mode = 'popup';
        $.fn.editable.defaults.placement = 'left';
        $.fn.editableform.buttons = '<button type="submit" class="editable-submit new-standards submit"><b class="icon-ok"></b></button>'+
                                    '<button type="button" class="editable-cancel new-standards"><b class="icon-remove"></b></button>';
        $.fn.combodate.defaults.minYear = 1930;
        $.fn.combodate.defaults.firstItem = "name";
        $.fn.combodate.defaults.maxYear = new Date().getFullYear();

    })(jQuery);

})(window, GZ, Backbone);
