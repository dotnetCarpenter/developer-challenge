define(['backbone'], function(Backbone) {
  'use strict';

  function router() {
    var controllerCache = {
      deactivate: function(controller) {
        return controller.deactivate();
      },
      activate: function(Controller, name, params) {
        if(!controllerCache.list)
          controllerCache.list = new Controller(params);

        return controller.activate();
      }
    };
    // The routes for the application
    return Backbone.Router.extend({
      routes: {
        "": "list",
        "list": "list",
        "top/:howmany": "top",
        "game/:matchid/:playerid":"game",
        "*404": "p404"
      },
      list: function() {
        console.log("list");
        require(["list/controller"], controllerCache.activate);
        // function(Controller) {
        //   if(!controllerCache.list)
        //     controllerCache.tool = new Controller();
        //   controllerCache.tool.activate();
          
        // });
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
