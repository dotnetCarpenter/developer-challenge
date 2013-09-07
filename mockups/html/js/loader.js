// Configure the AMD module loader
requirejs.config({
  // The path where your JavaScripts are located
  baseUrl: 'js',
  // Specify the paths of vendor libraries
  paths: {
    jquery: '../bower_components/jquery/jquery.min',
    underscore: '../bower_components/lodash/dist/lodash.underscore.min',
    backbone: '../bower_components/backbone/backbone',
    d3: '../bower_components/d3/'
  },
  // Backbone is not AMD-capable per default,
  // so we need to use the AMD wrapping of RequireJS
  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
  // For easier development, disable browser caching
  // Of course, this should be removed in a production environment
  //, urlArgs: 'bust=' +  (new Date()).getTime()
});

// Bootstrap the application
require(['routes', 'backbone'], function(routes, Backbone) {
  new routes();
  Backbone.history.start();
});