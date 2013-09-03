GZ.Views.TopNavCountdown = Backbone.Marionette.ItemView.extend({
    template: "#template-top-nav-countdown", // Template: top-nav-countdown.html

    tagName: 'li',

    ui: {
        progress: '.progress',
        progressBar: '.progress .bar'
    },

    modelEvents: {
        'change': 'render'
    },

    doLoop: true,
    time_limit: 15,

    loop: function () {
        if (this.doLoop) {
            this.partialUpdate();
            _.delay(_.bind(this.loop, this), 5000); // Update every 5s
        }
    },

    onShow: function () {
        this.loop();
    },

    onClose: function () {
        this.doLoop = false;
    },

    onRender: function () {
        this.partialUpdate();
    },

    partialUpdate: function () {
        this.updateBar();
        this.$('.countdown-text').html(this.text());
    },

    updateBar: function () {
        var minutes_left = this.left('minutes'),
            //minutes_left = 7,
            bar_width = Math.round(minutes_left/this.time_limit*100);

        if (this.model.inTransfer() && minutes_left <= this.time_limit) {
            this.ui.progressBar.toggleClass('bar-success', bar_width >= 66);
            this.ui.progressBar.toggleClass('bar-warning', bar_width >= 33 && bar_width < 66);
            this.ui.progressBar.toggleClass('bar-danger', bar_width < 33);
            this.ui.progressBar.css("width", ""+bar_width+"%");
            this.ui.progress.removeClass('hide');
        } else {
            this.ui.progress.addClass('hide');
        }
    },

    text: function () {
        var text,
            time = moment(this.nextWindow());
        if (!this.model.inTransfer() && !this.model.inMatch()) {
            text = GZ.helpers.i18n.gettext("League is over");
        } else if (this.model.inTransfer()) {
            if (this.left('minutes') > 0) {
                text = GZ.helpers.i18n.gettext('Matches start')+" ";
                if (this.left('hours') < 24) {
                    text += time.fromNow();
                } else {
                    text += time.calendar();
                }
            }
        }
        return text;
    },

    nextWindow: function () {
        return parseInt(this.model.get('next_window'), 10)+parseInt(this.model.get('delta'), 10);
    },

    left: function (unit) {
        return moment(this.nextWindow()).diff(new Date().getTime(), unit);
    }

});

