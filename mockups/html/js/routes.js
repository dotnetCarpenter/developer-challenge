define(['backbone'], function(Backbone) {
  'use strict';

  function router() {
    var controllerCache = {};
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
        require(["tool/controller"], function(Controller) {
          if(!controllerCache.tool)
            controllerCache.tool = new Controller();
          controllerCache.tool.activate();
          console.dir(controllerCache.tool);
        });
        // navigate like this:
        // this.navigate("game/"+ 3826 + "/" + 40236, { trigger: true });
      },
      top: function(howmany) {
        l("top::" + howmany);
      },
      game: function(matchid, playerid) {
        l("game::" + matchid + " with player::" + playerid);
      },
      p404: function() {
        l("404 not found");
      }
    });
  }

  return router();
  
});
