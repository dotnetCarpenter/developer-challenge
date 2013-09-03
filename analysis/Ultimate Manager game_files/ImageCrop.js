GZ.Views.Modals.ImageCrop = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    className: 'image-crop',
    template: '#template-modals-image-crop',

    ui: {
        cropImage: '.crop-image',
        finishButton: '.finish-button'
    },

    events: {
        'click .finish-button': 'finishAction'
    },

    initialize: function () {
        _.bindAll(this);
        this.deferred = new $.Deferred();
    },

    cropImage: function (file) {
        var defaultSelect,
            sideLength = Math.round(Math.min(file.width, file.height)*0.8);
        this.file = file;

        this.ui.cropImage.attr('src', file.url);

        defaultSelect = [(file.width-sideLength)/2, (file.height-sideLength)/2, sideLength, sideLength];

        this.ui.cropImage.Jcrop({
                    boxWidth: 650,
                    boxHeight: 380,
                    setSelect: defaultSelect,
                    trueSize: [file.width, file.height],
                    onSelect: this.onCropUpdate,
                    onUpdate: this.onCropUpdate,
                    onRelease: this.onCropUpdate,
                    aspectRatio: 1,
                    addClass: 'jcrop-container'
                }, _.bind(function () {
                    var container = this.$('.jcrop-container');
                    container.css( {
                        'left': '50%',
                        'margin-left': '-'+(container.width()/2 | 0)+'px'
                    } );
                }, this));
        return this.deferred.promise();
    },

    onCropUpdate: function (coords) {
        this.file.coords = coords;
        this.ui.finishButton.toggleClass("disabled", _.isEmpty(this.file.coords));
    },

    finishAction: function () {
        if (!_.isEmpty(this.file.coords)) {
            this.file.coords.x = Math.round(this.file.coords.x);
            this.file.coords.y = Math.round(this.file.coords.y);
            this.file.coords.w = Math.round(this.file.coords.w);
            this.file.coords.h = Math.round(this.file.coords.h);
            this.deferred.resolve(this.file);
        }
    }

});