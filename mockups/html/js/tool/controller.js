/**
 * Tool - a 
 * @version: 2013.9.1
 */

define(["backbone", "tool/model", "tool/view"], function(Backbone, ToolModel, ToolView) {
  "use strict";

  function Tool() {
    this.activate = function() {
      console.log("Tool is activating");
      this.view.render();
    };
    this.halt = function() { console.log("Halt is called on Tool"); };
    this.name ="ToolController";

    this.view = new ToolView({ controller: this });
    this.controller = new Backbone.Collection.extend({
      
    });
  }

  return Tool;
});
