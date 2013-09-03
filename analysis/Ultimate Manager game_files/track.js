(function(GZ){

    function pageview(page) {
        if (arguments.length === 1) {
            mp_trackpage(page);
            _gaq.push(['_trackPageview', page]);
            return;
        }
        mp_trackpage(location.pathname);
        _gaq.push(['_trackPageview']);
    }

    function mp_trackpage(page) {
        if (!_.isUndefined(window.mixpanel)) {
            mixpanel.track_pageview(page);
        }
    }

    function mp_track(name, properties, success_callback) {
        if (!_.isUndefined(window.mixpanel)) {
            mixpanel.track_pageview(name, properties, success_callback);
        }
    }

    function event(category, action, label, value) {

        // category and action are required
        if (arguments.length < 2 || arguments.length > 4) {
            console.error("Invalid event tracking arguments");
            return;
        }

        if (arguments.length === 4) {
            _gaq.push(['_trackEvent', category, action, label, value]);
        } else if (arguments.length === 3) {
            _gaq.push(['_trackEvent', category, action, label]);
        } else {
            _gaq.push(['_trackEvent', category, action]);
        }

    }

    function invites(medium, amount) {
        event("Invites", "invite", medium, amount);
    }

    GZ.helpers.track = {
        pageview: pageview,
        invites: invites,
        mp_track: mp_track,
        event: event
    };

})(GZ);
