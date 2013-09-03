/**
Multi editable input.
Internally value stored as {city: "Copenhagen", country: "Denmark"}

@class multi
@extends abstractinput
@final
@example
<a href="#" id="multi" data-type="multi" data-pk="1">awesome</a>
<script>
$(function(){
    $('#multi').editable({
        url: '/post',
        title: 'Enter city, and country',
        subInputs: {
            city: {
                type: 'text',
                value: 'Copenhagen'
            },
            country: {
                type: 'select',
                source: ['Sweden', 'Denmark', 'Norway'],
                value: 'Denmark'
            }
        }
    });
});
</script>
**/
(function ($) {
    var Multi = function (options) {
        this.init('Multi', options, Multi.defaults);
        this.inputs = {};
        $.each(this.options.subInputs, $.proxy(function (key, subOpts) {
            this.inputs[key] = new $.fn.editabletypes[subOpts.type](subOpts);
        }, this));
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Multi, $.fn.editabletypes.abstractinput);

    $.extend(Multi.prototype, {
        /**
        Prerenders all subinputs

        @method prerender()
        **/
        prerender: function () {
            var args = Array.prototype.slice.call(arguments);
            $.fn.editabletypes.abstractinput.prototype.prerender.apply(this, args);
            $.each(this.inputs, function (key, inp) {
                inp.prerender();
            });
        },

        /**
        Renders input from tpl

        @method render()
        **/
        render: function() {
            this.$tpl.parent().siblings('.editable-buttons').css({
                'display': 'block',
                'text-align': 'right',
                'margin-top': '7px'
            });
            this.$tpl.html("");
            var promises = $.map(this.inputs, $.proxy(function (inp, key) {
                var $wrapper = $(this.options.wrapper);
                $wrapper.find('.editable-title').html(inp.options.title);
                $wrapper.find('.editable-input').html(inp.$tpl);
                this.$tpl.append($wrapper);
                return inp.render();
            }, this));
            return $.when.apply(null, promises);
        },

        /**
        Postrenders all subinputs

        @method postrender()
        **/
        postrender: function () {
            $.each(this.inputs, function (key, inp) {
                if(inp.postrender) {
                    inp.postrender();
                }
            });
        },

        /**
        Default method to show value in element. Can be overwritten by display option.

        @method value2html(value, element)
        **/
        value2html: function(value, element) {
            if(!value) {
                $(element).empty();
                return;
            }
            if (this.options.encode) {
                $(element).html(this.options.encode(value));
            }
        },

        /**
        Gets value from element's html

        @method html2value(html)
        **/
        html2value: function(html) {
            if (this.options.decode) {
                return this.options.decode(html);
            }
            return null;
        },

       /**
        Converts value to string.
        It is used in internal comparing (not for sending to server).

        @method value2str(value)
       **/
        value2str: function(value) {
            if (this.options.encode) {
                var data = this.options.encode(value);
                return data;
            }
            return null;
        },

       /*
        Converts string to value. Used for reading value from 'data-value' attribute.

        @method str2value(str)
       */
       str2value: function(str) {
            // For multi-input it's not possible to set value by data-string
            return null;
       },


       value2submit: function (value) {
            return this.value2str(value);
       },

       /**
        Sets value of input.

        @method value2input(value)
        @param {mixed} value
       **/
       value2input: function(value) {
            $.each(this.inputs, function (key, inp) {
                if (inp.options.value) {
                    inp.value2input(inp.options.value);
                }
            });
       },

       /**
        Returns value of input.

        @method input2value()
       **/
       input2value: function() {
            var data = {};
            $.each(this.inputs, function (key, inp) {
                data[key] = inp.input2value();
            });
            return data;
       },

        /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
       activate: function() {
            this.$tpl.find('input').first().focus();
       },

       /**
        Attaches handler to submit form in case of 'showbuttons=false' mode

        @method autosubmit()
       **/
       autosubmit: function() {
           console.error('Multi inputs cannot autosubmit.');
       }
    });

    Multi.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-multi"></div>',
        wrapper: '<div class="editable-input-wrapper"><div class="editable-title"></div><div class="editable-input"></div></div>',

        inputclass: '',

        subInputs: [],
        encode: function (val) { return val; },
        decode: function (val) { return val; }
    });

    $.fn.editabletypes.multi = Multi;

}(window.jQuery));