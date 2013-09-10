/**
 * Tool - research architecture
 * @version: 2013.9.1
 */

define(["backbone", "tool/model", "tool/view"], function(Backbone, ToolModel, ToolView) {
  "use strict";

  function Tool() {
    this.activate = function() {
      console.log(this.name + " is activating");
      this.view.render();
    };
    this.deactivate = function() {
      console.log("Deactivate is called on " + this.name);
      this.view.close();
    };
    this.name = "ToolController";

    this.view = new ToolView({ controller: this });
    
  }

  return Tool;
});
