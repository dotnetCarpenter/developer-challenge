/**
 * Top - research architecture
 * @version: 2013.9.1
 */

define(["backbone", "top/model", "top/view"], function(Backbone, Model, View) {
  "use strict";

  function Controller() {
    this.activate = function() {
      console.log(this.name + " is activating");
      this.view.render();
    };
    this.deactivate = function(defer) {
      console.log("Deactivate is called on " + this.name);
      this.listenTo(this.view, "removed", function() {
        this.stopListening();
        defer.resolve();
      });
      this.view.close();
    };
    this.name = "TopTop";

    this.view = new View({ controller: this });
  }
  Controller.prototype = Backbone.Events;

  return Controller;
});
