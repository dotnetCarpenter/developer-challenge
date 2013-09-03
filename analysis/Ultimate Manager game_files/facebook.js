(function(GZ, Backbone){
    // We know the user is already logged in
    var callbackAfterLoad = function(){},
        loadDeferred = new $.Deferred(),
        loadPromise = loadDeferred.promise();

    var initOptions = {
        appId      : '467378873277262', // App ID
        channelUrl : '//'+location.hostname+location.port+'/app/helpers/facebookchannel.html', // Path to Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true, // parse XFBML
        frictionlessRequests: true
    };

    function load(callback) {
        if (!callback) return loadPromise;

        loadPromise.then(callback);
    }

    // Facebook specific global callback function
    function fbAsyncInit() {
        FB.init(initOptions);
        loadDeferred.resolve();
    }

    function getLoginStatus() {
        var d = new $.Deferred();
        load().then(function () {
            var cb = function (response) {
                if (response.status === "connected") {
                    d.resolve(response.authResponse);
                } else {
                    d.reject(response.status);
                }
            };
            FB.getLoginStatus(cb);
        });
        return d.promise();
    }

    function login(scope) {
        var d = new $.Deferred();
        load().then(function () {
            var cb = function (response) {
                if (response.status === "connected") {
                    d.resolve(response.authResponse);
                } else {
                    d.reject(response.status);
                }
            };
            FB.login(cb, scope);
        });
        return d.promise();
    }

    function insertScriptInDom() {
        // Load the SDK Asynchronously
        (function(d){
            var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) { return; }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));
    }

    GZ.helpers.facebook = {
        'load': load,
        'getLoginStatus': getLoginStatus,
        'login': login
    };
    window.fbAsyncInit = _.once(fbAsyncInit);
    GZ.app.on("initialize:after", insertScriptInDom);

})(GZ, Backbone);