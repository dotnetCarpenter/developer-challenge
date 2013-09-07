define([
  'chaplin',
  'models/base/model'
], function(Chaplin, Model) {
  'use strict';

  var League = Model.extend({
    defaults: {
      message: "Hello from League"
    }
    // ,initialize: function(attributes, options) {
    //  Model.prototype.initialize.apply(this, arguments);
    //  console.debug('HelloWorld#initialize');
    // }
  });

  return League;
});
