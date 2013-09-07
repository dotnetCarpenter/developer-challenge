define(['backbone'], function(Backbone) {
  'use strict';
  var l = console.log;  // not IE10
  // The routes for the application
  return Backbone.Router.extend({
    routes: {
      "": "default",
      "top/:howmany": "top",
      "game/:matchid/:playerid":"game",
      "*404": "p404"
    },
    default: function() {
      l("tool");
      this.navigate("game/"+ 3826 + "/" + 40236, { trigger: true });
    },
    top: function(howmany) {
      l("top::" + howmany);
    },
    game: function(matchid, playerid) {
      l("game::" + matchid + " with player::" + playerid);
    },
    p404: function() {
      l("not found");
    }
  });
});
