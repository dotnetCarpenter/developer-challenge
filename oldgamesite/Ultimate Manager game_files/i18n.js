(function(GZ, Backbone){
    var translations = {},
        locale = "en_US";

    // Dummy used in the detection script of strings
    function none_gettext(str) {
        return str;
    }

    function gettext(singular, plural, count) {
        var translation = "",
            translationFrom = singular;
        if (plural) {
            if (count == 1) {
                translationFrom = singular;
            } else {
                translationFrom = plural;
            }
        }
        if (!_.isUndefined(translations[locale]) && !_.isUndefined(translations[locale][translationFrom])) {
            translation = $.trim(translations[locale][translationFrom]);
        }
        if (!translation.length) {
            translation = translationFrom;
        }
        return translation;
    }

    function format(str, replacers) {
        if (!_.isArray(replacers)) replacers = [replacers];
        _.each(replacers, function (rep) {
            str = str.replace("%s", rep);
        });
        return str;
    }

    function setLocale(newLocale) {
        locale = newLocale;
        if (!_.isUndefined(moment)) {
            setupMoment(newLocale);
        }
    }

    function setupMoment(newLocale) {
        moment.lang(newLocale, {
            months: [
                gettext('January'),
                gettext('February'),
                gettext('March'),
                gettext('April'),
                gettext('May'),
                gettext('June'),
                gettext('July'),
                gettext('August'),
                gettext('September'),
                gettext('October'),
                gettext('November'),
                gettext('December')
            ],
            monthsShort: [
                gettext('Jan'),
                gettext('Feb'),
                gettext('Mar'),
                gettext('Apr'),
                gettext('May'),
                gettext('Jun'),
                gettext('Jul'),
                gettext('Aug'),
                gettext('Sep'),
                gettext('Oct'),
                gettext('Nov'),
                gettext('Dec')
            ],
            weekdays: [
                gettext('Sunday'),
                gettext('Monday'),
                gettext('Tuesday'),
                gettext('Wednesday'),
                gettext('Thursday'),
                gettext('Friday'),
                gettext('Saturday')
            ],
            weekdaysShort: [
                gettext('Sun'),
                gettext('Mon'),
                gettext('Tue'),
                gettext('Wed'),
                gettext('Thu'),
                gettext('Fri'),
                gettext('Sat')
            ],
            weekdaysMin: [
                gettext('Su'),
                gettext('Mo'),
                gettext('Tu'),
                gettext('We'),
                gettext('Th'),
                gettext('Fr'),
                gettext('Sa')
            ],
            calendar : {
                sameDay : gettext('[Today at] LT'),
                nextDay : gettext('[Tomorrow at] LT'),
                nextWeek : gettext('dddd [at] LT'),
                lastDay : gettext('[Yesterday at] LT'),
                lastWeek : gettext('[Last] dddd [at] LT'),
                sameElse : 'LLLL'
            },
            relativeTime: {
                'future': gettext("in %s"),
                'past':   gettext("%s ago"),
                's':      gettext("seconds"),
                'm':      gettext("a minute"),
                'mm':     gettext("%d minutes"),
                'h':      gettext("an hour"),
                'hh':     gettext("%d hours"),
                'd':      gettext("a day"),
                'dd':     gettext("%d days"),
                'M':      gettext("a month"),
                'MM':     gettext("%d months"),
                'y':      gettext("a year"),
                'yy':     gettext("%d years")
            }
        });
    }

    function addTranslation(locale, trans) {
        translations[locale] = {};
        _.each(trans['default'], function (value, key) {
            translations[locale][key] = value[1];
            if (value[0]) translations[locale][value[0]] = value[2];
        });
    }

    function loadTranslations(locale, url) {
        if (locale === "en_US") return; // Do not try to load the default locale
        $.getJSON(url, function (response, status) {
            if (status === "success") {
                addTranslation(response);
            }

        });
    }

    function getLocale() {
        return locale;
    }

    function getSeparators() {
        var out = {
            normal: ",",
            decimal: "."
        };
        if (locale == "da_DK") {
            out.normal = ".";
            out.decimal = ",";
        }
        return out;
    }

    GZ.helpers.i18n = {
        none_gettext: none_gettext,
        gettext: gettext,
        format: format,
        setLocale: setLocale,
        loadTranslations: loadTranslations,
        addTranslation: addTranslation,
        getLocale: getLocale,
        getSeparators: getSeparators
    };

})(GZ, Backbone);