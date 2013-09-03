(function(GZ){

    var day = 1000 * 60 * 60 * 24;

    function getMatch(id) {
        var match = GZ.Leagues.findMatch(id);
        if (!_.isUndefined(match)) {
            return match.toJSON();
        }
    }

    function matchStatus(match) {

        if (!match.period) {
            return "";
        }

        if (!_.isString(match.period)) return '';

        switch (match.period) {
            case "PreMatch":
                return "";
            case "FirstHalf":
            case "HalfTime":
            case "SecondHalf":
                return "ongoing";
            case "FullTime":
            case "Postponed":
                return "ended";
            default:
                return "ongoing";
        }
    }

    function statusTime(match) {
        if (_.indexOf(['FullTime','HalfTime','FirstHalf','SecondHalf','Postponed','1','2'], match.period) > -1) {
            return gameMinutes(match.period, match.minute || match.minutes);
        }

        var date = new Date(match.played_on),
            hour = date.getHours(),
            minute = ('0'+date.getMinutes()).slice(-2),
            readableTime = [hour, minute].join(':');

        return readableTime;
    }

    function gameMinutes(period, minutes) {
        if (period === "FullTime") {
            return "FT";
        } else if (period === "HalfTime" || period == 'SecondHalf' && _.isUndefined(minutes)) {
            return "HT";
        } else if (period === "Postponed") {
            return "Postp.";
        } else if (!_.isUndefined(minutes)) {
            var overTime = 0;
            if (_.indexOf(['FirstHalf', '1'], period) > -1 && minutes > 45) {
                overTime = 45;
            } else if (_.indexOf(['SecondHalf', '2'], period) > -1 && minutes > 90) {
                overTime = 90;
            }
            if (overTime > 0 && minutes > overTime) {
                return formatGameMinutes(overTime, (minutes - overTime));
            }
            return formatGameMinutes(minutes);
        }
        return null;
    }

    function formatGameMinutes(minutes, overTime) {
        var out = "";
        minutes = parseInt(minutes, 10);
        if (_.isNumber(minutes)) {
            if (minutes === 0) {
                minutes++;
            }
            if (minutes > 90) {
                overTime = minutes-90;
                minutes = 90;
            }
            out += minutes+"&#39;";
            if (overTime) {
                out += "+"+overTime;
            }
        }
        return out;
    }

    GZ.helpers.match = {
        getMatch: getMatch,
        statusTime: statusTime,
        formatGameMinutes: formatGameMinutes,
        matchStatus: matchStatus,
        gameMinutes: gameMinutes
    };

})(GZ);