GZ = GZ || {};
GZ.Backend = "/api";
GZ.controllers = {};
GZ.Models = {};
GZ.Mixins = {};
GZ.Collections = {};
GZ.Controllers = {};
GZ.Views = {};
GZ.helpers = {};
GZ.app = new Backbone.Marionette.Application();

$.ajaxSettings.traditional = true;

if (!window.console) {
    window.console = {log:function nop(){}};
    console.debug = console.warning = console.error = console.log;
}
_.templateSettings = {
    evaluate: /<\$([\s\S]+?)\$>/g,
    interpolate: /<\$=([\s\S]+?)\$>/g,
    escape: /<\$-([\s\S]+?)\$>/g,
    translate: /<\$~([\s\S]+?)\$>/g,
    translationFunc: "GZ.helpers.i18n.gettext"
};

// Add an extra template shorthand to do translations
(function (_) {
    _.oldTemplate = _.template;

    var noMatch = /(.)^/;

    _.template = function (text, data, settings) {        var render;
        settings = _.defaults({}, settings, _.templateSettings);
        text = text.replace(settings.translate || noMatch, function(match, translation, offset) {
            return "<$= "+settings.translationFunc+"("+translation+") $>";
        });
        return _.oldTemplate(text, data, settings);
    };
})(_);