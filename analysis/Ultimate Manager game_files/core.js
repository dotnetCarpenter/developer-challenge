(function(window, GZ, Backbone, undefined) {


    function apiResponseParse(data) {
        if (typeof data.response === "undefined") {
            return data;
        }
        return data.response;
    }

    function apiResponse(successCallback) {
        return function(data) {
            if (data.status == 'ok') return successCallback(data);
            alert(data.response || 'An unknown error occured');
        };
    }

    /* Use PUT instead of PATCH since IE8 doesn't support it. */
    function sync(method, model, options) {
        if (method === 'patch') {
            method = 'update';
        }

        if (_.isUndefined(options.attrs)) {
            options.attrs = model.toJSON();
            if (!_.isUndefined(model.jsonFilters) && !_.isUndefined(model.jsonFilters[method])) {
                options.attrs = _.pick(options.attrs, model.jsonFilters[method]);
            }
        }

        // Piggybacked error handling from the backend.
        var error = options.error;
        options.error = function(model, xhr, options) {
            var errorData;
            if (!_.isUndefined(xhr.responseText)) {
                errorData = JSON.parse(xhr.responseText);
                model.errors = _.reduce(errorData.errors, function (memo, errors, field) {
                    memo[field] = _.map(errors, function (err) {
                        if (!_.isUndefined(model.errorMessages) &&
                            !_.isUndefined(model.errorMessages[field]) &&
                            !_.isUndefined(model.errorMessages[field][err.code])) {
                            return model.errorMessages[field][err.code];
                        }
                        return err.message;
                    });
                    return memo;
                }, {});
            }
            if (error) error(model, xhr, options);
        };
        return Backbone.sync.call(this, method, model, options);
    }

    GZ.ModelValidation = {

        errors: {},

        defaultValidations: {
            email: function (val) {
                var emailValidationPattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
                return (val.match(emailValidationPattern) !== null);
            },
            length: function (val) {
                if (_.isUndefined(val)) return true;
                return (val.length > 0);
            },
            require: function (val) {
                return !_.isUndefined(val);
            }
        },

        isValueValid: function (attr, value, inputValidation) {
            var validation = inputValidation || this.validations[attr];
            if (_.isArray(validation)) {
                return _.all(validation, function (v) {
                    return this.isValueValid(attr, value, v);
                }, this);
            }
            if (_.isString(validation.validator) && this.defaultValidations[validation.validator]) {
                return this.defaultValidations[validation.validator](value);
            }
            if (_.isFunction(validation.validator)) {
                return validation.validator(value);
            }
            return false;
        },

        isValid: function () {
            return _.isEmpty(this.errors);
        },

        runValidation: function () {
            this.errors = {};
            if (!_.isUndefined(this.validations)) {
                _.each(_.keys(this.validations), function (attr) {
                    this._validateAttribute(attr);
                }, this);
            }
        },

        _validateAttribute: function (attr, inputValidation) {
            var validation = inputValidation || this.validations[attr];

            // Handle multiple validations
            if (_.isArray(validation)) {
                return _.some(validation, function (v) {
                    return (this._validateAttribute(attr, v) === false);
                }, this);
            }

            if (!this.isValueValid(attr, this.get(attr), validation)) {
                this.errors[attr] = validation.msg;
                return false;
            }
            return true;
        }
    };

    // Core models, with api-specific parsing
    GZ.Model = Backbone.Model.extend({
        parse: apiResponseParse,
        sync: sync,
        apiResponse: apiResponse,
        clientUrl: function() {
            if (_.isUndefined(this.clientUrlRoot)) {
                throw new Error('clientUrlRoot must be defined when calling method clientUrl');
            }

            return [
                this.clientUrlRoot.replace(/\/+$/, ''),
                this.get('id')
            ].join('/');
        }
    });

    GZ.Collection = Backbone.Collection.extend({
        parse: apiResponseParse
    });

    GZ.CurrentCollection = GZ.Collection.extend({

        currentModel: undefined,

        constructor: function () {
            var args = Array.prototype.slice.call(arguments);
            this.on('sync', this._updateCurrent, this);
            GZ.Collection.apply( this, args );
        },

        getCurrent: function () {
            if(this.length === 0) {
                return undefined;
            }
            if (_.isUndefined(this.currentModel)) {
                this.setCurrent(this.at(0));
            }
            return this.currentModel;
        },

        setCurrent: function (newModel) {
            if (this.currentModel == newModel) {
                return;
            }
            if (_.isUndefined(this.get(newModel))) {
                throw new Error("The model must be part of the collection.");
            }
            this.currentModel = newModel;
            if (_.isFunction(this.currentModel.onCurrent)) {
                this.currentModel.onCurrent(newModel);
            }
        },

        _updateCurrent: function () {
            var model;
            if (!_.isUndefined(this.currentModel)) {
                model = this.get(this.currentModel.id);
                if (!_.isUndefined(model)) {
                    this.setCurrent(model);
                }
            }
        }
    });

    GZ.RelationalModel = Backbone.RelationalModel.extend({
        parse: apiResponseParse,
        sync: sync
    });

    GZ.Stubs = {};
    GZ.Static = {};
    GZ.Models = {};
    GZ.Collections = {};

})(window, GZ, Backbone);
