requirejs.config({
  baseUrl: '/js/',
  urlArgs: 'cb=' + Math.random(),
  paths: {
    jasmine: '../tests/lib/jasmine-1.3.1/jasmine',
    'jasmine-html': '../tests/lib/jasmine-1.3.1/jasmine-html',
    jquery: '../bower_components/jquery/jquery',
    underscore: '../bower_components/lodash/lodash',
    backbone: '../bower_components/backbone/backbone',
    handlebars: '../bower_components/handlebars/handlebars',
    text: '../bower_components/requirejs-text/text',
    chaplin: '../bower_components/chaplin/chaplin',
    spec: '../tests/spec'
  },
  // Underscore and Backbone are not AMD-capable per default,
  // so we need to use the AMD wrapping of RequireJS
  shim: {
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    }
  }
});

require(['underscore', 'jquery', 'jasmine-html'], function(_, $, jasmine) {

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var specs = [];
 
  specs.push('spec/Handlebars');

  $(function(){
    require(specs, function(){
      jasmineEnv.execute();
    });
  });

  // var currentWindowOnload = window.onload;

  // window.onload = function() {
  //   if (currentWindowOnload) {
  //     currentWindowOnload();
  //   }
  //   execJasmine();
  // };

  // function execJasmine() {
  //   jasmineEnv.execute();
  // }
});