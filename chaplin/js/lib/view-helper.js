define([
  'handlebars',
  'chaplin',
  'lib/utils'
], function(Handlebars, Chaplin, utils) {
  'use strict';

  // Application-specific Handlebars helpers
  // -------------------------------------------

  // Get Chaplin-declared named routes. {{#url "like" "105"}}{{/url}}.
  Handlebars.registerHelper('url', function(routeName) {
    var params = [].slice.call(arguments, 1);
    var options = params.pop();
    return Chaplin.helpers.reverse(routeName, params);
  });

  // Create select box
  // @author Jon
  Handlebars.registerHelper('select', function(pairs, options) {
    return "<select>" + _(pairs).map(function(pair) {
      return "<option value='" + pair[1] + "'>" + pair[0] + "</option>";
    }).join('') + "</select>";
  });
});
