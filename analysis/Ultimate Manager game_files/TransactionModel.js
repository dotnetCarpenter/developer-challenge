GZ.Models.TransactionModel = GZ.RelationalModel.extend({

    observeTransaction: function(transactionId) {
        var model = this;
        transactionId = transactionId || this.get('transaction');

        if (_.isUndefined(transactionId)) return false;

        var timeout = 2000,
            getStatus = function() {
                $.getJSON(
                    [GZ.Backend, 'transaction', transactionId].join('/'),
                    function(data) {
                        switch (data.response.task_status) {
                            case 'error':
                            case 'failure':
                                return model.trigger('transaction:' + data.response.task_status, data.response.message, data.response.errors);

                            case 'done':
                                return model.trigger('transaction:' + data.response.task_status);
                        }

                        model.trigger('transaction:' + data.response.task_status);

                        setTimeout(getStatus, Math.min(128000, timeout *= 2));
                    }
                );
            };

        getStatus();
    }

});