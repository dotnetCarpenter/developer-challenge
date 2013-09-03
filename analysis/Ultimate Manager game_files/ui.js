(function(GZ, Backbone){

    /* Default graph options */

    function hundredKTicks(val, axis) {
        val /= 1000;
        return val.toFixed(axis.tickDecimals) + "K   ";
    }

    var country = {
        unknown: 'Unknown',
        codeMap: {"AF": "Afghanistan","AL": "Albania","DZ": "Algeria","AS": "American Samoa","AD": "Andorra","AO": "Angola","AI": "Anguilla","AQ": "Antarctica","AG": "Antigua and Barbuda","AR": "Argentina","AM": "Armenia","AW": "Aruba","AU": "Australia","AT": "Austria","AZ": "Azerbaijan","BS": "Bahamas","BH": "Bahrain","BD": "Bangladesh","BB": "Barbados","BY": "Belarus","BE": "Belgium","BZ": "Belize","BJ": "Benin","BM": "Bermuda","BT": "Bhutan","BO": "Bolivia, Plurinational State of","BA": "Bosnia and Herzegovina","BW": "Botswana","BV": "Bouvet Island","BR": "Brazil","IO": "British Indian Ocean Territory","BN": "Brunei Darussalam","BG": "Bulgaria","BF": "Burkina Faso","BI": "Burundi","KH": "Cambodia","CM": "Cameroon","CA": "Canada","CV": "Cape Verde","KY": "Cayman Islands","CF": "Central African Republic","TD": "Chad","CL": "Chile","CN": "China","CX": "Christmas Island","CC": "Cocos (Keeling) Islands","CO": "Colombia","KM": "Comoros","CG": "Congo","CD": "Congo, the Democratic Republic of the","CK": "Cook Islands","CR": "Costa Rica","CI":["Côte d'Ivoire","Ivory Coast"],"HR": "Croatia","CU": "Cuba","CY": "Cyprus","CZ": "Czech Republic","DK": "Denmark","DJ": "Djibouti","DM": "Dominica","DO": "Dominican Republic","EC": "Ecuador","EG": "Egypt","SV": "El Salvador","GQ": "Equatorial Guinea","ER": "Eritrea","EE": "Estonia","ET": "Ethiopia","FK": "Falkland Islands (Malvinas)","FO": "Faroe Islands","FJ": "Fiji","FI": "Finland","FR": "France","GF": "French Guiana","PF": "French Polynesia","TF": "French Southern Territories","GA": "Gabon","GM": "Gambia","GE": "Georgia","DE": "Germany","GH": "Ghana","GI": "Gibraltar","GR": "Greece","GL": "Greenland","GD": "Grenada","GP": "Guadeloupe","GU": "Guam","GT": "Guatemala","GG": "Guernsey","GN": "Guinea","GW": "Guinea-Bissau","GY": "Guyana","HT": "Haiti","HM": "Heard Island and McDonald Islands","VA": "Holy See (Vatican City State)","HN": "Honduras","HK": "Hong Kong","HU": "Hungary","IS": "Iceland","IN": "India","ID": "Indonesia","IR": "Iran, Islamic Republic of","IQ": "Iraq","IE": "Ireland","IM": "Isle of Man","IL": "Israel","IT": "Italy","JM": "Jamaica","JP": "Japan","JE": "Jersey","JO": "Jordan","KZ": "Kazakhstan","KE": "Kenya","KI": "Kiribati","KP": "Korea, Democratic People's Republic of","KR": "Korea, Republic of","KW": "Kuwait","KG": "Kyrgyzstan","LA": "Lao People's Democratic Republic","LV": "Latvia","LB": "Lebanon","LS": "Lesotho","LR": "Liberia","LY": "Libyan Arab Jamahiriya","LI": "Liechtenstein","LT": "Lithuania","LU": "Luxembourg","MO": "Macao","MK": "Macedonia, the former Yugoslav Republic of","MG": "Madagascar","MW": "Malawi","MY": "Malaysia","MV": "Maldives","ML": "Mali","MT": "Malta","MH": "Marshall Islands","MQ": "Martinique","MR": "Mauritania","MU": "Mauritius","YT": "Mayotte","MX": "Mexico","FM": "Micronesia, Federated States of","MD": "Moldova, Republic of","MC": "Monaco","MN": "Mongolia","ME": "Montenegro","MS": "Montserrat","MA": "Morocco","MZ": "Mozambique","MM": "Myanmar","NA": "Namibia","NR": "Nauru","NP": "Nepal","NL": "Netherlands","AN": "Netherlands Antilles","NC": "New Caledonia","NZ": "New Zealand","NI": "Nicaragua","NE": "Niger","NG": "Nigeria","NU": "Niue","NF": "Norfolk Island","MP": "Northern Mariana Islands","NO": "Norway","OM": "Oman","PK": "Pakistan","PW": "Palau","PS": "Palestinian Territory, Occupied","PA": "Panama","PG": "Papua New Guinea","PY": "Paraguay","PE": "Peru","PH": "Philippines","PN": "Pitcairn","PL": "Poland","PT": "Portugal","PR": "Puerto Rico","QA": "Qatar","RE": "Réunion","RO": "Romania","RU": "Russian Federation","RW": "Rwanda","SH": "Saint Helena, Ascension and Tristan da Cunha","KN": "Saint Kitts and Nevis","LC": "Saint Lucia","PM": "Saint Pierre and Miquelon","VC": "Saint Vincent and the Grenadines","WS": "Samoa","SM": "San Marino","ST": "Sao Tome and Principe","SA": "Saudi Arabia","SN": "Senegal","RS": "Serbia","SC": "Seychelles","SL": "Sierra Leone","SG": "Singapore","SK": "Slovakia","SI": "Slovenia","SB": "Solomon Islands","SO": "Somalia","ZA": "South Africa","GS": "South Georgia and the South Sandwich Islands","ES": "Spain","LK": "Sri Lanka","SD": "Sudan","SR": "Suriname","SJ": "Svalbard and Jan Mayen","SZ": "Swaziland","SE": "Sweden","CH": "Switzerland","SY": "Syrian Arab Republic","TW": "Taiwan, Province of China","TJ": "Tajikistan","TZ": "Tanzania, United Republic of","TH": "Thailand","TL": "Timor-Leste","TG": "Togo","TK": "Tokelau","TO": "Tonga","TT": "Trinidad and Tobago","TN": "Tunisia","TR": "Turkey","TM": "Turkmenistan","TC": "Turks and Caicos Islands","TV": "Tuvalu","UG": "Uganda","UA": "Ukraine","AE": "United Arab Emirates","GB": "United Kingdom","US":["USA", "United States"],"UM": "United States Minor Outlying Islands","UY": "Uruguay","UZ": "Uzbekistan","VU": "Vanuatu","VE": "Venezuela, Bolivarian Republic of","VN": "Viet Nam","VG": "Virgin Islands, British","VI": "Virgin Islands, U.S.","WF": "Wallis and Futuna","EH": "Western Sahara","YE": "Yemen","ZM": "Zambia","ZW": "Zimbabwe"/*CUSTOM CODES*/,"EN": "England","WA": "Wales","SQ": "Scotland"},
        // ISO 3166 country code
        isoToFullName: function(iso) {
            return country.codeMap[iso] || country.unknown;
        },
        fullNameToISO: function(fullName, lowerCase) {
            function returnVal(value) {
                if (lowerCase === true) return value.toLowerCase();
                return value;
            }

            for (var key in country.codeMap) {
                var countryName = country.codeMap[key];
                if ((typeof countryName).toLowerCase() == 'object') {
                    for (var i = 0, n = countryName.length; i < n; i++) {
                        if (countryName[i] == fullName) return returnVal(key);
                    }
                } else if (country.codeMap[key] == fullName) {
                    return returnVal(key);
                }
            }
        },
        // Strips ISO 639 language code from combined codes where
        // ISO 639 (language codes) and ISO 3166 (country codes)
        // are combined.
        stripLanguage: function(code) {
            var s = "";
            if (!_.isUndefined(code)) {
                s = code.split("_");
                if (s.length > 1) {
                    return s[1].toUpperCase();
                }
            }
            return undefined;
        }
    };

    /* end of default graph options */

    function playerSquad(id, full) {
        var squad = GZ.helpers.squad.getForPlayer(id),
            key = full ? "name" : "shortname";
        return squad ? squad.get(key) : 'XXX';
    }

    function playerNickname(player) {
        if (!_.isObject(player)){
            player = GZ.helpers.player.find(player).toJSON();
        }
        if (_.isFunction(player.toJSON)) {
            player = player.toJSON();
        }

        if (!player) {
            return GZ.helpers.i18n.gettext("Unknown Player");
        }

        if (!_.isUndefined(player.known_name) && !_.isNull(player.known_name)) {
            return player.known_name;
        }
        return player.first_name + " " + player.last_name;
    }

    function playerPitchName(player) {
        var out = player.first_name.charAt(0) + ". " + player.last_name, known = player.known_name;

        if (known && known !== (player.first_name + " " + player.last_name) ) {
            out = known;
        }

        return out;
    }

    function playerShortName(id) {
        var player = GZ.helpers.player.find(id);

        if (!player) {
            return "X. Unknown";
        }

        var name = player.has("known_name") ?
            player.get("known_name") :
            player.get("first_name") + " " + player.get("last_name");

        return name.replace(/^(.)[^\s]+/, "$1.");

    }

    function playerPosition(position) {
        // Mapping backend position to UX demand
        var pos = position,
            translation = {
                "Goalkeeper": GZ.helpers.i18n.gettext("Goalkeeper"),
                "Defender": GZ.helpers.i18n.gettext("Defender"),
                "Midfielder": GZ.helpers.i18n.gettext("Midfielder"),
                "Attacker": GZ.helpers.i18n.gettext("Attacker")
            };
        if (pos === "Forward") {
            pos = "Attacker";
        }
        return translation[pos];
    }

    function playerShortPosition(position)
    {
        var pos = position.substr(0, 3).toUpperCase(),
            translation = {
                "GOA": GZ.helpers.i18n.gettext("GOA"),
                "DEF": GZ.helpers.i18n.gettext("DEF"),
                "MID": GZ.helpers.i18n.gettext("MID"),
                "ATT": GZ.helpers.i18n.gettext("ATT")
            };
        if (pos === "FOR") {
            pos = "ATT";
        }
        return translation[pos];
    }

    function findSquad(id) {

        if (id instanceof GZ.Models.Squad) {
            return squad;
        }

        return Backbone.Relational.store.find(GZ.Models.Squad, id);
    }

    function squadName(id) {
        var squad;

        try
        {
            squad = findSquad(id);
        }
        catch(e)
        {
            console.error(e.stack);
        }

        return squad.get("name");

    }

    function squadShortName(id) {
        var squad;

        try
        {
            squad = findSquad(id);
        }
        catch(e)
        {
            console.error(e.stack);
        }
        if (!_.isNull(squad)) {
            return squad.get("shortname");
        }
        return undefined;
    }

    var days = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
    var months = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");

    var gameDateFormat = "#DAY, #MONTH #DATE #YEAR, #HOUR:#MINUTE";

    function gameDate(dateStr) {
        var d = new Date(dateStr);

        return gameDateFormat
            .replace(/#DAY/,days[d.getDay()])
            .replace(/#MONTH/, months[d.getMonth()])
            .replace(/#DATE/, d.getDate())
            .replace(/#YEAR/, d.getFullYear())
            .replace(/#HOUR/, d.getHours())
            .replace(/#MINUTE/, d.getMinutes());
    }

    var matchDateFormat = "#MONTH #DATE";

    function matchDate(dateNumber) {
        var d = new Date(dateNumber);

        return matchDateFormat
            .replace(/#MONTH/, months[d.getMonth()])
            .replace(/#DATE/, d.getDate());
    }

    /* Number formattings */

    var thousand = 1000,
        decithousand = 100 * thousand,
        million = thousand * thousand;

    function mapThousandSeparator(val, idx) {
        return (idx%3 === 0 && idx !== 0) ? val + GZ.helpers.i18n.getSeparators().normal : val;
    }

    function toMoney(number) {
        number = 0 + number;
        if (isNaN(number)) {
            return 0;
        }

        var sign = number >= 0 ? "" : "-";
        var out = _.map((""+Math.abs(number)).split("").reverse(), mapThousandSeparator).reverse().join("");
        return sign + (out.indexOf(GZ.helpers.i18n.getSeparators().normal) === 0 ? out.substring(1) : out);
    }

    /*
    * Expected outputs:
    * 978,000: <1M
    * 1,099,000: 1.1M
    * 9,867,234: 9.9M
    * -1,000,000: -1.0M
    */
    function toShortMoney(number, onlyPositive) {
        if (onlyPositive !== false && number < million) {
            return "<1M";
        }

        var outValue = Math.round(number / decithousand) / 10,
            outDeci = outValue % 1,
            outMil = outValue - outDeci;

        return [
            outMil,
            GZ.helpers.i18n.getSeparators().decimal,
            Math.round(Math.abs(outDeci) * 10),
            'M'
        ].join('');
    }

    /*
     * Format earnings for short format.
     * Expected result:
     *   < -1,000,000: rounded to 1 decimal and appended a "M".
     *   -1,000,000 - 1,000,000: rounded to nearest integer and appended a "K".
     *   > 1,000,000: rounded to 1 decimal and appended a "M".
     */
    function formatEarnings(inputNumber) {
        var number = Math.round(inputNumber/1000);
        if (number < 1000 && number > -1000) {
            return number+"K";
        }
        return toShortMoney(inputNumber, false);
    }

    function formatFormation(formation) {
        if (!_.isString(formation)) {
            return formation;
        }
        return formation.split('').join('-');
    }

    var currencyMap = {
        'dkk': 'kr',
        'sek': 'kr',
        'usd': '$',
        'eur': '€'
    };

    function formatPackageMoney(number, currency) {
        if (_.isNaN(number)) {
            return "NaN";
        }
        var out = parseFloat(number).toFixed(2);
        // Replace .00 with .-
        if (out.slice(-2) == "00") {
            out = out.slice(0,-2)+"-";
        }
        if (GZ.helpers.i18n.getSeparators().decimal != ".") {
            out = out.replace(".", GZ.helpers.i18n.getSeparators().decimal);
        }
        if (!_.isUndefined(currency) && !_.isUndefined(currencyMap[currency])) {
            out = currencyMap[currency]+" "+out;
        }
        return out;
    }

    function score(matchEvent, separator) {
        var home = 0,
            away = 0;

        separator = separator || ":";

        if (!arguments.length) {
            console.error("Input required for score.");
            return;
        }

        if (matchEvent.period == 'Postponed') {
            home = away = '-';
        } else {
            if (matchEvent.home && matchEvent.home.score) {
                home = matchEvent.home.score;
            }

            if (matchEvent.away && matchEvent.away.score) {
                away = matchEvent.away.score;
            }

            if(home < 0 || away < 0) {
                console.error("Cannot format a negative score. Input: ", matchEvent);
                return;
            }
        }

        return [home, away].join(separator);
    }

    function percent(val) {
        if (!arguments.length) {
            console.error("An input is required.");
            return;
        }

        // isNumber() equivalent
        if ( isNaN(parseFloat(val)) || !isFinite(val) ) {
            console.error("The input is not a number. Input: ", val);
            return;
        }

        if (val >= -1 && val <= 1) {
            return Math.round(val * 100) + "%";
        }
        return Math.round(val) + "%";
    }

    /**
    * Generates a slug from a string.
    * See: http://en.wikipedia.org/wiki/Slug_(web_publishing)
    */
    function slug(str) {
        return str
            .toLowerCase()
            .replace(/ /g,'-')        // Spaces are replaced with dashes
            .replace(/[^\w\-]+/g,'');  // Non-alphanumeric or dash characters are removed
    }
    function padDigits(number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }

    function getReadableActionName(actionName) {
        var map = { "goal": GZ.helpers.i18n.none_gettext("Goal"),
                    "assist": GZ.helpers.i18n.none_gettext("Assist"),
                    "big_chance_created": GZ.helpers.i18n.none_gettext("Big chance created"),
                    "starting_11": GZ.helpers.i18n.none_gettext("In starting 11"),
                    "shot_on_target": GZ.helpers.i18n.none_gettext("Shot on target"),
                    "cross_completed": GZ.helpers.i18n.none_gettext("Cross completed"),
                    "blocked_shot": GZ.helpers.i18n.none_gettext("Blocked shot"),
                    "dribble_won": GZ.helpers.i18n.none_gettext("Dribble won"),
                    "long_pass": GZ.helpers.i18n.none_gettext("Long pass"),
                    "aerial_duel_won": GZ.helpers.i18n.none_gettext("Aerial duel won"),
                    "successful_duel": GZ.helpers.i18n.none_gettext("Successful duel"),
                    "defensive_clearance": GZ.helpers.i18n.none_gettext("Defensive Clearance"),
                    "interception": GZ.helpers.i18n.none_gettext("Interception"),
                    "successful_pass": GZ.helpers.i18n.none_gettext("Successful pass"),
                    "offside": GZ.helpers.i18n.none_gettext("Offside"),
                    "conceded_penalty": GZ.helpers.i18n.none_gettext("Conceded penalty"),
                    "yellow_card": GZ.helpers.i18n.none_gettext("Yellow card"),
                    "own_goal": GZ.helpers.i18n.none_gettext("Own goal"),
                    "penalty_missed": GZ.helpers.i18n.none_gettext("Penalty missed"),
                    "red_card": GZ.helpers.i18n.none_gettext("Red card"),
                    "penalty_saved": GZ.helpers.i18n.none_gettext("Penalty saved"),
                    "attempt_saved": GZ.helpers.i18n.none_gettext("Attempt saved"),
                    "cross_intercepted": GZ.helpers.i18n.none_gettext("Cross intercepted"),
                    "goal_against_team": GZ.helpers.i18n.none_gettext("Goal against (team)"),
                    "clean_sheet": GZ.helpers.i18n.none_gettext("Clean sheet"),
                    "goal_scored_team": GZ.helpers.i18n.none_gettext("Goal scored (by team)"),
                    "match_won": GZ.helpers.i18n.none_gettext("Match won"),
                    "match_lost": GZ.helpers.i18n.none_gettext("Match lost"),
                    "referee_error": GZ.helpers.i18n.none_gettext("Referee Error"),
                    "duel_won": GZ.helpers.i18n.none_gettext("Duel won"),
                    "avg_earnings": GZ.helpers.i18n.none_gettext("Avg. earnings"),
                    "clean_sheets": GZ.helpers.i18n.none_gettext("Clean sheets"),
                    "cross_interception": GZ.helpers.i18n.none_gettext("Cross interception"),
                    "penalty_won": GZ.helpers.i18n.none_gettext("Penalty won"),
                    "hit_woodwork": GZ.helpers.i18n.none_gettext("Hit woodwork")
                };

        if (map[actionName]) return GZ.helpers.i18n.gettext(map[actionName]);
        return actionName;
    }

    function nl2br(text, escape) {
        return (escape ? _.escape(text) : text).replace(/\n/g, '<br>');
    }

    function pitchPlayerClass(playerId) {
        var league, leagueClass, squad, squadClass, skinClass,
            player = GZ.helpers.player.find(playerId);
        if (!_.isUndefined(player) && !_.isNull(player)) {
            squad = player.get("squad");
            if (!_.isUndefined(squad) && !_.isNull(squad)) {
                if (!_.isUndefined(GZ.Leagues) && !_.isNull(GZ.Leagues)) {
                    league = GZ.Leagues.get(squad.get('league_id'));
                    if (!_.isUndefined(league) && !_.isNull(league)) {
                        leagueClass = league.get('common_name').toLowerCase().replace(" ", "-");
                        squadClass = squad.get('shortname');
                        if (player.get('position') == "Goalkeeper") {
                            squadClass = "goalkeeper";
                        }
                        skinClass = player.get('skin') || "white"; // Use white if no skin color is present
                        return [leagueClass, squadClass, skinClass].join("-");
                    }
                }
            }
        }
        return "XXX";
    }

    function crestClass(squadId) {
        var league, leagueClass, squad, squadClass, skinClass;
        squad = GZ.helpers.squad.find(squadId);
        if (!_.isUndefined(squad)) {
            league = GZ.Leagues.get(squad.get('league_id'));
            if (!_.isUndefined(league)) {
                leagueClass = league.get('common_name').toLowerCase().replace(" ", "-");
                squadClass = squad.get('shortname');
                return [leagueClass, squadClass].join("-");
            }
        }
        return "";
    }

    GZ.helpers.ui = {
        playerSquad: playerSquad,
        playerNickname: playerNickname,
        playerPitchName: playerPitchName,
        playerShortName: playerShortName,
        playerPosition: playerPosition,
        playerShortPosition: playerShortPosition,
        pitchPlayerClass: pitchPlayerClass,
        crestClass: crestClass,
        squadName: squadName,
        squadShortName: squadShortName,
        gameDate: gameDate,
        matchDate: matchDate,
        toMoney: toMoney,
        toShortMoney: toShortMoney,
        formatPackageMoney: formatPackageMoney,
        formatEarnings: formatEarnings,
        formatFormation: formatFormation,
        score: score,
        percent: percent,
        slug: slug,
        padDigits: padDigits,
        getReadableActionName: getReadableActionName,
        country: country,
        nl2br: nl2br
    };

})(GZ, Backbone);
