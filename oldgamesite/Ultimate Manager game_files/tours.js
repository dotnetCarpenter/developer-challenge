GZ.helpers.tours = {};

GZ.helpers.tours.welcomeTour = GZ.Views.Tour.extend({

    steps: [
        {
            headline: function () {
                return GZ.helpers.i18n.gettext('Welcome, boss!');
            },
            text: function () {
                return GZ.helpers.i18n.gettext('Since this is your first time setting up a team, we would like to introduce you to the basics.');
            },
            button: function () {
                return GZ.helpers.i18n.gettext('Awesome, go!');
            }
        },
        {
            headline: function () {
                return GZ.helpers.i18n.gettext('Your budget is £100m');
            },
            text: function () {
                return [
                    GZ.helpers.i18n.gettext('There is no fee to buy and sell players in between rounds.'),
                    GZ.helpers.i18n.gettext('Thus you should consider the upcoming round only, when buying players.'),
                    GZ.helpers.i18n.gettext('<strong>Click a team</strong> in the fixtures list that you believe will win it\'s match.')
                ];
            },
            settings: {
                'location': 'left',
                'anchor': '.live-score'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "fixtures:selectedSquad", function () {
                        d.resolve();
                    });
                    return d;
                },
                hide: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "transfers:playerBought", function () {
                        d.resolve();
                    });
                    return d;
                }
            },
            setup: function () {
                var self = this;
                $('#squadlisttablebody').parent().on('update', function () {
                    var playerName = $('#squadlisttablebody tr:eq(0) td.td2').data('value');
                    self.$('span.player-name').html(playerName);
                });
            },
            headline: function () {
                return GZ.helpers.i18n.gettext('Buy a player');
            },
            text: function () {
                return [
                    GZ.helpers.i18n.format(
                        GZ.helpers.i18n.gettext("Now click the plus button next to %s to buy him for your team."),
                        '<span class="player-name"></span>'
                    )
                ];
            },
            settings: {
                'location': 'top',
                'anchor': '#squadlisttablebody'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "transfers:playerBought", function () {
                        d.resolve();
                    });
                    return d;
                },
                hide: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "transfers:playerBought", function () {
                        d.resolve();
                    });
                    return d;
                }
            },
            headline: function () {
                return GZ.helpers.i18n.gettext('Buy 10 more players');
            },
            text: function () {
                return [
                    GZ.helpers.i18n.gettext('Now select 10 more players and you have a full team.')
                ];
            },
            settings: {
                'location': 'top',
                'anchor': '#squadlisttablebody'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    this.listenTo(GZ.app.vent, "transfers:playerBought", function () {
                        if (GZ.app.reqres.request('team:isFull') && !GZ.app.reqres.request('team:hasCaptain')) {
                            d.resolve();
                        }
                    });
                    return d;
                },
                hide: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "transfers:setcaptain", function () {
                        d.resolve();
                    });
                    return d;
                }

            },
            headline: function () {
                return GZ.helpers.i18n.gettext('Time to choose a captain');
            },
            text: function () {
                return GZ.helpers.i18n.format(GZ.helpers.i18n.gettext("Mouse over your favourite player and click the %s"), '<i class="icon-info-sign"></i>');
            },
            settings: {
                'anchor': '.playergrid',
                'location': 'bottom'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    this.listenTo(GZ.app.vent, "showplayer", function () {
                        if (GZ.app.reqres.request('team:isFull') && !GZ.app.reqres.request('team:hasCaptain')) {
                            GZ.app.vent.off("showplayer", this);
                            d.resolve();
                        }
                    });
                    return d;
                },
                hide: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, "transfers:setcaptain", function () {
                        d.resolve();
                    });
                    return d;
                }
            },
            headline: function () {
                return GZ.helpers.i18n.gettext('Click <em>Set captain</em>');
            },
            text: '',
            settings: {
                'location': 'left',
                'anchor': '.t3 .player-bio .action'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    var resolver = function () {
                        if (GZ.app.reqres.request('team:isValid')) {
                            GZ.app.vent.off("transfers:playerBought", this);
                            d.resolve();
                        }
                    };
                    this.listenTo(GZ.app.vent, "transfers:playerBought", resolver);
                    this.listenToOnce(GZ.app.vent, "transfers:setcaptain", resolver);
                    return d;
                }
            },
            headline: function () {
                return GZ.helpers.i18n.gettext("Save your team");
            },
            text: function () {
                return [
                    GZ.helpers.i18n.gettext("That's it! Your team is ready to compete."),
                    GZ.helpers.i18n.gettext('Click the <em>Save team</em> button')
                ];
            },
            settings: {
                'location': 'top',
                'anchor': '.save-team'
            }
        }
    ]

});

GZ.helpers.tours.livefeedTour = GZ.Views.Tour.extend({

    currentIndex: 0,
    livefeedItems: [],
    activeFeed: false,

    steps: [
        {
            headline: function () {
                return GZ.helpers.i18n.gettext('Congratulations on your new team!');
            },
            text: function () {
                return [
                    GZ.helpers.i18n.gettext('You can follow your player live when they play matches.'),
                    GZ.helpers.i18n.gettext('<strong>Select the Live feed tab</strong> to activate the Live feed.')
                ];
            },
            settings: {
                'anchor': '.t3 .navigation-bar',
                'location': 'left'
            }
        },
        {
            requirements: {
                show: function () {
                    var d = new $.Deferred();
                    this.listenToOnce(GZ.app.vent, 'sidebar:tabselect:livefeed', function () {
                        d.resolve();
                    });
                    return d;
                }
            },
            headline: function () {
                return GZ.helpers.i18n.gettext('Live feed active!');
            },
            text: function () {
                var team = GZ.Teams.getCurrent(),
                    matchTimes = _.map(team.getUpcomingMatches(), function (m) {
                        return m.get("played_on");
                    }),
                    firstMatchTime = _.min(matchTimes),
                    firstMatchText = moment(firstMatchTime).calendar();

                return [
                    GZ.helpers.i18n.gettext('The live feed looks like this on match days when your players are playing.'),
                    GZ.helpers.i18n.gettext('Follow your players live:'),
                    '<strong>'+firstMatchText+'<strong>'
                ];
            },
            button: function () {
                return GZ.helpers.i18n.gettext('Cool, I got it!');
            },
            settings: {
                'location': 'left',
                'anchor': '.t3 .feed-list'
            }
        }
    ],

    feed: function () {
        var lf = GZ.Teams.getCurrent().getLiveFeed(),
            feeds = this.livefeedItems[this.currentIndex];
        if (this.activeFeed) {
            if (!_.isUndefined(feeds)) {
                lf.add(feeds);
            }
            this.currentIndex++;
            _.delay(_.bind(this.feed, this), 1000);
        }
    },

    onShow: function () {
        var lf = GZ.Teams.getCurrent().getLiveFeed();
        this._origFetch = lf.fetch;
        this._origGetMatch = GZ.helpers.match.getMatch;
        lf.fetch = function () {
            return new $.Deferred().resolve({status: "ok", response: []});
        };
        $.getJSON('/assets/livefeed_tour.json', _.bind(function (data) {
            var events = data.events,
                baseTimestamp;

            _.times(10, function () {
                var item = events.pop();
                baseTimestamp = item.timestamp;
                lf.add(item);
            }, this);
            this.livefeedItems = _.groupBy(events, function (d) {
                return Math.floor((d.timestamp-baseTimestamp)/1000);
            }, this);
            this.activeFeed = true;
            this.feed();

            GZ.helpers.match.getMatch = function (id) {
                return _.find(data.matches, function (m) {
                    return m.id === id;
                });
            };
        }, this));
    },

    onClose: function () {
        var lf = GZ.Teams.getCurrent().getLiveFeed();
        this.activeFeed = false;
        GZ.helpers.match.getMatch = this._origGetMatch;
        lf.fetch = this._origFetch;
        lf.reset(null);
    }

});