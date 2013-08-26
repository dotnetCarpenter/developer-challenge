GZ.Mixins.SocketBindings = {

    initSocket: function () {
        this._bindings = {};
        this._subscriptions = {};
    },

    bindToEndpoint: function(endpoint, callback, context) {
        var connection = GZ.helpers.sockets.getEndpoint(endpoint),
            handler = _.bind(callback, context || this);
        this._bindings[endpoint] = {
            connection: connection,
            handler: handler
        };
        connection.on('message', handler);
        connection.on('disconnect', _.partial(_.bind(this.onSocketDisconnect, this), endpoint));
    },

    unbindToEndpoint: function(endpoint) {
        var connection, handler;
        if (!_.isUndefined(this._bindings[endpoint])) {
            connection = this._bindings[endpoint].connection;
            handler = this._bindings[endpoint].handler;
            connection.removeListener('message', handler);
            delete this._bindings[endpoint];
        }
    },

    subscribeId: function (endpoint, id) {
        this._subscriptions[endpoint+":"+id] = id;
        this._sendAction('subscribe', endpoint, id);
    },

    unsubscribeId: function (endpoint, id) {
        delete this._subscriptions[endpoint+":"+id];
        this._sendAction('unsubscribe', endpoint, id);
    },

    onSocketConnect: function (endpoint) {
        _.each(this._subscriptions, function (v, k) {
            if (k.indexOf(endpoint+":") !== -1) {
                this.unsubscribeId(endpoint, v);
                this.subscribeId(endpoint, v);
            }
        }, this);
    },

    onSocketDisconnect: function (endpoint, reason) {
        var connection;
        if (!_.isUndefined(this._bindings[endpoint])) {
            connection = this._bindings[endpoint].connection;
            // Setup a listener for the connection so we can resubscribe.
            connection.once('connect', _.once(_.partial(_.bind(this.onSocketConnect, this), endpoint)));
        }
    },

    _sendAction: function (action, endpoint, id) {
        if (!_.isUndefined(endpoint)) {
            var connection = GZ.helpers.sockets.getEndpoint(endpoint);
            connection.send(JSON.stringify({
                'action': action,
                'id': id
            }));
        }
    }

};