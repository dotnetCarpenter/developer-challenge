GZ.Views.EditableSection = Backbone.Marionette.ItemView.extend({

    extraOptions: {},

    modelEvents: {
        change: "render",
        reset: "render"
    },

    initialize: function (options) {
        if (!_.isUndefined(options.extraOptions)) {
            this.extraOptions = options.extraOptions;
        }
    },

    templateHelpers: function () {
        var data = {};
        data.isEditable = this.model.canEdit();
        return data;
    },

    onRender: function () {
        if (this.model.canEdit()) {
            var that = this;
            $.each(this.$('.editable'), function () {
                var conf = {
                        'url': _.bind(that.handleSavedField, that),
                        'params': function (params) { params.$el = $(this); return params; }
                    },
                    extraOptions = that.extraOptions[$(this).data('name')];
                    if (_.isFunction(extraOptions)){
                        extraOptions = extraOptions.call(that);
                    }

                if (!_.isUndefined(extraOptions)) {
                    conf = _.extend(conf, extraOptions);
                }
                $(this).editable(conf);
            });
        }
    },

    handleSavedField: function (data) {
        var value = data.value;
        if (data.$el.data('type') && data.$el.data('type') == "combodate") {
            // Special date handling
            if (data.value) {
                value = moment(data.value, data.$el.data('format')).valueOf();
            } else {
                value = moment().valueOf();
            }
        }
        var d = new $.Deferred(),
            options = { success: function () {
                            d.resolve();
                        },
                        error: function (model, xhr) {
                            var errorMsg = "",
                                json;
                            if (xhr.responseText) {
                                json = JSON.parse(xhr.responseText);
                                errorMsg = json.message;
                                if (!_.isUndefined(json.errors) && !_.isUndefined(json.errors[data.name])) {
                                    errorMsg = _.pluck(json.errors[data.name], "message").join(", ");
                                }
                            } else {
                                errorMsg = xhr.statusText;
                            }
                            d.reject(errorMsg);
                        },
                        wait: true,
                        patch: true
                    },
            saveData = {};
        saveData[data.name] = value;
        this.model.save(saveData, options);
        return d.promise();
    }


});