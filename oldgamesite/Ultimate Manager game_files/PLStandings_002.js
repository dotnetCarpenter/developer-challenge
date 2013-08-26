GZ.Collections.PLStandings = GZ.Collection.extend({

    model: GZ.Models.PLStanding,

    url: function () {
        return GZ.Backend + "/leagues/"+GZ.Leagues.getCurrent().id+"/standings";
    }

});