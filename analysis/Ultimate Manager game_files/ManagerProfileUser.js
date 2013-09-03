GZ.Views.ManagerProfileUser = GZ.Views.EditableSection.extend({

    isIOS: false,

    template: '#template-manager-profile-user', // Template: manager-profile-user.html

    ui: {
        picture: '.picture',
        changePictureBtn: '#change-profile-picture'
    },

    events: {
        'click #change-profile-picture': 'togglePictureMenu',
        'change .choose-file input': 'onFileChosen',
        'click #change-profile-picture-menu .take-picture': 'onTakePicture'
    },

    extraOptions: {
        'birthday': {
            'display': function (birthday) {
                var diff = Math.floor(moment().diff(birthday, 'years', true));
                $(this).html(diff);
            }
        },
        'favourite_team': {
            'source': [
                {text: "Premier League (England)", children: ["Arsenal", "Aston Villa", "Chelsea", "Cardiff City", "Crystal Palace", "Everton", "Fulham", "Hull City", "Liverpool", "Manchester City", "Manchester United", "Newcastle United", "Norwich City", "Southampton", "Stoke City", "Sunderland", "Swansea City", "Tottenham Hotspur", "West Bromwich Albion", "West Ham United"]},
                {text: "Bundesliga (Germany)", children: ["Augsburg", "Bayer Leverkusen", "Bayern München", "Braunschweig", "Dortmund", "Eintracht Frankfurt", "FC Nürnberg", "Freiburg", "Hamburger SV", "Hannover 96", "Hertha Berlin", "Hoffenheim", "Mainz 05", "Mönchengladbach", "Schalke 04", "VfB Stuttgart", "Werder Bremen", "Wolfsburg"]},
                {text: "Primera Division (Spain)", children: ["Almeria", "Athletic Bilbao", "Atletico Madrid", "Barcelona", "Betis", "Celta Vigo", "Elche", "Espanyol", "Getafe", "Granada", "Levante", "Malaga", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Valladolid", "Villarreal"]},
                {text: "Serie A (Italy)", children: ["AC Milan", "Atalanta", "Bologna", "Cagliari", "Catania", "Chievo", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Livorno", "Napoli", "Parma", "Roma", "Sampdoria", "Sassuolo", "Torino", "Udinese", "Verona"]},
                {text: "Ligue 1 (France)", children: ["Ajaccio", "Bastia", "Bordeaux", "Evian Thonon Gaillard", "Guingamp", "Lille", "Lorient", "Lyon", "Marseille", "Monaco", "Montpellier", "Nantes", "Nice", "Paris SG", "Reims", "Rennes", "Sochaux", "St. Etienne", "Toulouse", "Valenciennes"]}
            ]
        },
        'location': function () {
            var location;
            if (!_.isUndefined(this.model)) {
                location = this.model.get('location');
            }
            if (!_.isObject(location)) {
                location = this.decodeLocation(location);
            }
            return {
                type: 'multi',
                title: GZ.helpers.i18n.gettext('Please choose your location'),
                emptytext: GZ.helpers.i18n.gettext('Unknown location'),
                encode: this.encodeLocation,
                decode: this.decodeLocation,
                subInputs: {
                    city: {
                        title: GZ.helpers.i18n.gettext('City'),
                        type: 'text',
                        value: location.city
                    },
                    country: {
                        title: GZ.helpers.i18n.gettext('Country'),
                        type: 'select',
                        source: _.values(GZ.helpers.ui.country.codeMap),
                        value: location.country
                    }
                }
            };
        }
    },

    templateHelpers: function () {
        var data = GZ.Views.EditableSection.prototype.templateHelpers.call(this),
            loc = '';
        if (!_.isUndefined(this.model)) {
            loc = this.decodeLocation(this.model.get('location'));
            data.locationCountry = loc.country;
        }
        return data;
    },

    initialize: function () {
        _.bindAll(this, "getFileStat", "showCropper", "cropFile", "savePicture", "showLoadProgress");

        this.isIOS = (window.navigator.userAgent.indexOf(' AppleWebKit/') > -1 &&
                      window.navigator.userAgent.indexOf(' Mobile/') > -1);

        $('html').on('click', this.clearPictureMenu);

        this.loaderModal = new GZ.Views.Modals.Loader();
    },

    encodeLocation: function (location) {
        if (!_.isUndefined(location) && !_.isNull(location)) {
            return [location.city, location.country].join(', ');
        }
        return "";
    },

    decodeLocation: function (location) {
        var endsWith = function (str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            },
            countries = _.values(GZ.helpers.ui.country.codeMap),
            country,
            city;

        if (!_.isUndefined(location) && !_.isNull(location)) {
            country = _.find(countries, _.partial(endsWith, location));
            city = location;

            // We found a country, let's remove it from location
            // and let the rest be the city.
            if (!_.isUndefined(country)) {
                var idx = city.indexOf(country, city.length-country.length);
                city = $.trim(city.substring(0, idx));
                if (endsWith(city, ",")) {
                    city = city.substring(0, city.length-1);
                }
            }
        }
        return {city: city, country: country};
    },

    clearPictureMenu: function () {
        $('#change-profile-picture').removeClass('active');
        $('#change-profile-picture-menu').removeClass('active');
    },

    togglePictureMenu: function (e) {
        // Do not show menu on iOS.
        if (!this.isIOS) {
            e.stopPropagation();

            $('#change-profile-picture').toggleClass('active');
            $('#change-profile-picture-menu').toggleClass('active');
        }
    },

    onFileChosen: function (event) {
        this.loaderModal.set('header', "Uploading picture");
        this.loaderModal.set('deterministic', true);
        this.loaderModal.set('progress', 0);
        GZ.helpers.modal.open(this.loaderModal, {size: {width: 500, height: 500}});

        GZ.helpers.filepicker.upload(event.target)
            .pipe(this.getFileStat)
            .pipe(this.showCropper)
            .pipe(this.cropFile)
            .pipe(this.savePicture)
            .then(function () {
                GZ.helpers.modal.close();
            },
            function(fperror) {
                console.error(fperror.toString());
            },
            this.showLoadProgress);
    },

    getFileStat: function (file) {
        return GZ.helpers.filepicker.stat(file,
            { path: true, width: true, height: true});
    },

    showCropper: function (file) {
        var cropper = new GZ.Views.Modals.ImageCrop();
        GZ.helpers.modal.open(cropper, {size: {width: 500, height: 500}});
        return cropper.cropImage(file);
    },

    cropFile: function (file) {
        this.loaderModal.set('header', "Cropping");
        this.loaderModal.set('deterministic', true);
        this.loaderModal.set('progress', 0);
        GZ.helpers.modal.open(this.loaderModal, {size: {width: 500, height: 500}});

        return GZ.helpers.filepicker.crop(file, {crop: [file.coords.x, file.coords.y, file.coords.w, file.coords.h]});
    },

    savePicture: function (file) {
        this.model.set('picture', file.url);
        return this.model.save({
            'picture': file.url
        }, {
            'wait': true,
            'patch': true
        }).then(_.bind(function () { this.model.fetch(); }, this));
    },

    showLoadProgress: function (progress) {
        this.loaderModal.set('progress', progress);
    },

    onTakePicture: function () {
        var webcamModal = new GZ.Views.Modals.TakeWebcamPicture();
        GZ.helpers.modal.open(webcamModal, {size: {width: 500, height: 500}});

        GZ.helpers.filepicker.takePicture("webcam-iframe")
            .pipe(this.getFileStat)
            .pipe(this.showCropper)
            .pipe(this.cropFile)
            .pipe(this.savePicture)
            .then(function () {
                GZ.helpers.modal.close();
            },
            function(fperror) {
                console.error(fperror.toString());
            },
            this.showLoadProgress);
    },

    onRender: function () {
        var args = Array.prototype.slice.call(arguments);
        GZ.Views.EditableSection.prototype.onRender.apply(this, args);

        this.ui.picture.toggleClass('image-editable', this.model.canEdit());
        this.ui.changePictureBtn.toggleClass('choose-file', this.isIOS);
        this.ui.changePictureBtn.toggleClass('sticky', this.isIOS);

        this.delegateEvents();
    }


});