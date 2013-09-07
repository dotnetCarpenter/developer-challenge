define([
  'chaplin',
  'models/base/model',
  'models/base/collection',
  'models/actions',
  'models/league',
  'models/squads',
  'config'
], function(Chaplin, Model, Collection, Actions, League, Squads, config) {
  'use strict';

  // pick by value rather than key
  var byValue = function byValue(name) {
    return function(key, value) {
      return (key === name);
    };
  };
  // Could be renamed to tool-service
  var Aggregate = Model.extend({

    initialize: function(attributes, options) {
      Model.prototype.initialize.apply(this, _.extend(arguments, this.getCollection(attributes.select[0][1])));
      //console.debug('Aggregate#initialize', attributes);
      // this.getCollection(attributes.select[0][1]);
    },

    collections: {
      actionsList: new Collection({
        model: Actions,
        url: config.data.Actions
      }),
      leagueList: new Collection({
        model: League,
        url: config.data.League
      }),
      squadsList: new Collection({
        model: Squads,
        url: config.data.Squads
      })
    },

    getCollection: function(dataurl) {
      var pair = _.flatten(_.pairs(_.pick(
              config.data,
              byValue( dataurl )
          )));
      
      return this.collections[ String(pair[0]).toLowerCase() + 'List'];
      // this.model = this.collections[ String(pair[0]).toLowerCase() + 'List'];
      // this.model.url = pair[1]; // this is unreasonable(!)
      // if( this.model.serialize().length < 2/* not === 0 as the controller injects select and status */)
      //   this.model.fetch();
      // this.model.trigger("change");
      // console.dir(this.collection);
    }

  });

  return Aggregate;
});
