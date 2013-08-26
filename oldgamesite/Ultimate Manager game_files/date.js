(function(GZ){

    var exports = {},
        secondInMs = 1000,
        minuteInMs = secondInMs * 60,
        hourInMs = minuteInMs * 60,
        dayInMs = hourInMs * 24;


    function sameDay(timestamp, midnight) {
        return timestamp >= midnight && timestamp < (midnight + dayInMs);
    }

    function day(timestamp) {
        var d = new Date(timestamp);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);

        return d.getTime();
    }

    // Copyright: http://ejohn.org/blog/javascript-pretty-date/
    function prettify(time, excludeHourInLocale, delta){
        delta = delta || new Date().getTime();
        var date = new Date(time),
            diff = ((delta - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);

        if ( isNaN(day_diff) || day_diff >= 31 ) {
            if (excludeHourInLocale === true) return date.toLocaleDateString();
            return [date.toLocaleDateString(), date.toLocaleTimeString()].join(' ');
        }


        if (day_diff <= 0) {
            if (diff < 60) {
                return GZ.helpers.i18n.gettext("just now");
            } else if (diff < 120) {
                return GZ.helpers.i18n.gettext("1 minute ago");
            } else if (diff < 3600) {
                return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("%s minutes ago"), Math.floor( diff / 60 ));
            } else if (diff < 7200) {
                return GZ.helpers.i18n.gettext("1 hour ago");
            } else {
                return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("%s hours ago"), Math.floor( diff / 3600 ));
            }
        } else if (day_diff === 1) {
            return GZ.helpers.i18n.gettext("Yesterday");
        } else if (day_diff < 7) {
            return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("%s days ago"), day_diff);
        } else if (day_diff === 7) {
            return GZ.helpers.i18n.gettext("1 week ago");
        } else {
            return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("%s weeks ago"), Math.ceil( day_diff / 7 ));
        }
    }


    GZ.helpers.date = _.extend(exports, {
        day: day,
        sameDay: sameDay,
        prettify: prettify
    });

})(GZ);
