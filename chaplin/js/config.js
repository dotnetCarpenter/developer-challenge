define(function() {
    'use strict';
    // Simple switch to change between dev path and prod path
    var production = false;

    var Challenge = {};
    // set app configuration
    Challenge.data = {
        Actions: "data/actions.json",
        League: "data/league.json",
        Squads: "data/squads.json"
    };
    Challenge.api = {
        version: "/0.1.0",
        root: production ? "/" : "/" // does nothing in the challenge
    };

    return Challenge;
});
