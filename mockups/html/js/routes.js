define(['backbone', 'jquery'], function(Backbone, $) {
  'use strict';

  function router() {
    /* controllerCache
     * Very simple control flow logic
     * @version 2013.9.1
     */
    var controllerCache = {
      currentController: undefined,
      deactivate: function() {
        var deferred = new $.Deferred();
        if(this.currentController) {
          this.currentController.deactivate(deferred);
        } else {
          deferred.resolve();
        }
        return deferred.promise();
      },
      activate: function(name, params) {
        var self = this;
        return function(Controller) {
          if(!controllerCache[name])
            controllerCache[name] = new Controller(params);
// console.dir(controllerCache[name]);
          self.currentController = controllerCache[name];
          controllerCache[name].activate();
        }
      },
      load: function(name, defer, activator) {
        require([name + '/controller'], function(Controller) {
          defer.done(function() {
            activator(Controller);
          })
        });
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

        var deativator = controllerCache.deactivate();  // deactive previous controller and get a deferred object
        controllerCache.load("tool", deativator, controllerCache.activate("tool"));  // require controller and activate once deativation is complete

        // navigate like this:
        // this.navigate("game/"+ 3826 + "/" + 40236, { trigger: true });
      },
      top: function(howmany) {
        console.log("top::" + howmany);

        var deativator = controllerCache.deactivate();  // deactive previous controller and get a deferred object
        controllerCache.load("top", deativator, controllerCache.activate("top"));  // require controller and activate once deativation is complete
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
