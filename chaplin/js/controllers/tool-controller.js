define([
  'controllers/base/controller',
  'models/base/collection',
  'models/aggregate',
  'config', // get configuration
  'views/tool-view'
], function(Controller, Collection, Aggregate, config, ToolView) {
  'use strict';

  var initial;

  var ToolController = Controller.extend({
    show: function(params) {
      console.log("ToolController", params);

      // delegates passed to view [target-action pattern]
      this.action = function (dataurl) {
        //this.model.getCollection(dataurl);
        /*this.model = */this.model.set(this.model.getCollection(dataurl));
        this.model.fetch().then(this.view.render);
      };

      // properties
      this.model = new Aggregate({
        select: _.pairs(config.data), // set data urls
        status: "Vælg dataset"
      });

      this.view = new ToolView({
        region: 'main',
        model: this.model,
        target: this.action
      });
    }
  });

  return ToolController;
});
