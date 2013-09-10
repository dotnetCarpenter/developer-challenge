define(['backbone'], function(Backbone) {
  'use strict';

  function router() {
    /* controllerCache
     * Very simple control flow logic
     * @version 2013.9.1
     */
    var controllerCache = {
      currentController: undefined,
      deactivate: function(controller) {
        controller.deactivate();
      },
      activate: function(name, params) {
        var self = this;
        return function(Controller) {
          if(!controllerCache[name])
            controllerCache[name] = new Controller(params);
          console.dir(controllerCache[name]);
          self.currentController = controllerCache[name];
          controllerCache[name].activate();
        }
      }
    };
    // The routes for the application
    return Backbone.Router.extend({
      routes: {
        "": "tool",
        "tool": "tool",
        "top/:howmany": "top",
        "game/:matchid/:playerid":"game",
        "*404": "p404"
      },
      tool: function() {
        console.log("tool");
        if(controllerCache.currentController) // could easily be refactored into controllerCache
          controllerCache.deactivate(controllerCache.currentController);
        require(["tool/controller"], controllerCache.activate("tool"));
        // navigate like this:
        // this.navigate("game/"+ 3826 + "/" + 40236, { trigger: true });
      },
      top: function(howmany) {
        console.log("top::" + howmany);
        if(controllerCache.currentController) // could easily be refactored into controllerCache
          controllerCache.deactivate(controllerCache.currentController);
        require(["top/controller"], controllerCache.activate("top", howmany));
      },
      game: function(matchid, playerid) {
        console.log("game::" + matchid + " with player::" + playerid);
      },
      p404: function() {
        console.log("404 not found");
      }
    });
  }

  return router();
  
});
