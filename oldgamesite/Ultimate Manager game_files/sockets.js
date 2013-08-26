// New sockets helper. Yes, an actual helper lib.
(function(helpers){

    var transport,
        base = location.protocol + "//" + location.hostname,
        socketOptions = {
            rememberTransport: false,
            transports: ["websocket", "xhr-polling", "htmlfile", "jsonp-polling"]
        };

    // @public
    function getEndpoint(endpoint) {
        if (_.isUndefined(transport)) {
            transport = io.connect(base, socketOptions);
            transport.on('disconnect', onTransportDisconnect);

            // If we have had a timer hickup we make sure the connection is still good.
            GZ.app.vent.on('timer:hickup', function (timeDiff) {
                // Reconnect base socket on hickup.
                GZ.helpers.sockets.getEndpoint().socket.reconnect();
            });
        }
        return transport.of(endpoint);
    }

    function onTransportDisconnect() {
        console.error("socket transport closed");
    }

    function debug() {
        _.each(io.sockets, function (sock) {
            _.each(sock.namespaces, function (sn, ns) {
                var sendEmitWrapper = function () {
                    var args = Array.prototype.slice.call(arguments);
                    func = args.shift();
                    console.debug("Sock <--", ns, args);
                    return func.call(this, args);
                };
                sn.emit = _.wrap(sn.emit, sendEmitWrapper);
                sn.send = _.wrap(sn.send, sendEmitWrapper);
                sn.on('message', function (data) {
                    console.debug('Sock -->', ns, data);
                });
            });
        });
        console.log("Socket debugging started!");
    }

    helpers.sockets = {
        getEndpoint: getEndpoint,
        debug: debug
    };

})(GZ.helpers);