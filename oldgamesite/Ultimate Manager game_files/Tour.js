GZ.Views.TourStep = Backbone.Marionette.ItemView.extend({

    tagName: 'div',
    template: '#template-tour-step',
    className: 'joyride-tip-guide',

    events: {
        'click .next-step': 'nextStep'
    },

    templateHelpers: function () {
        var texts = this.model.get('text'),
            headline = this.model.get('headline'),
            button = this.model.get('button');

        if (_.isFunction(texts)) {
            texts = texts.call(this);
        }
        if (!_.isArray(texts)) {
            texts = [texts];
        }

        if (_.isFunction(headline)) {
            headline = headline.call(this);
        }
        if (_.isFunction(button)) {
            button = button.call(this);
        }
        return {
            headline: headline,
            texts: texts,
            button: button
        };
    },

    initialize: function () {
        var setup = this.model.get('setup');

        // Adding listenToOnce to Backbone.Events for backbone version < 1.0.0 support
        if (_.isUndefined(this.listenToOnce)) {
            this.listenToOnce = function(obj, name, callback) {
                // An inversion-of-control version of `once`. Tell *this* object to listen to
                // an event in another object ... keeping track of what it's listening to.
                var listeners = this._listeners || (this._listeners = {});
                var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
                listeners[id] = obj;
                obj.once(name, typeof name === 'object' ? this : callback, this);
                return this;
            };
        }

        this.setupRequirement('show');

        if (!_.isUndefined(setup)) {
            if (!_.isFunction(setup)) {
                console.error('Setup must be function!');
                return;
            }
            setup.call(this);
        }
    },

    showStep: function () {
        var top, left,
            s = this.model.get('settings') || {},
            $w = $(window),
            $anchor = $(s.anchor),
            $nub = this.$('.joyride-nub'),
            nub_height = Math.ceil($nub.outerHeight() / 2),
            nub_width = Math.ceil($nub.outerWidth() / 2);

        if ($anchor.length) {
            if (_.isUndefined(s.location)) {
                s.location = "top";
            }
            if (_.isUndefined(s.nubLocation)) {
                s.nubLocation = ({top: 'bottom', bottom: 'top', left: 'right', right: 'left'})[s.location];
            }
            if (s.location === "top") {
                top = ($anchor.offset().top - this.$el.outerHeight() - nub_height);
                left = $anchor.offset().left;
            } else if (s.location === "left") {
                top = $anchor.offset().top;
                left = $anchor.offset().left - this.$el.outerWidth() - nub_width;
            } else if (s.location === "right") {
                top = $anchor.offset().top;
                left = $anchor.outerWidth() + $anchor.offset().left + nub_width;
            } else if (s.location === "bottom") {
                top = $anchor.offset().top + nub_height + $anchor.outerHeight();
                left = $anchor.offset().left;
            }
            $nub.removeClass('top left right bottom');
            $nub.addClass(s.nubLocation);
        } else {
            // Show as modal
            $nub.hide();

            top = (($w.height() - this.$el.outerHeight()) / 2) + $w.scrollTop();
            left = (($w.width() - this.$el.outerWidth()) / 2) + $w.scrollLeft();

            if ($('.joyride-modal-bg').length < 1) {
                $('body').append('<div class="joyride-modal-bg"></div>').show();
            }
            $('.joyride-modal-bg').fadeIn(300);
        }

        this.$el.css({
            'visibility': 'visible',
            'display': 'block',
            'top': top+'px',
            'left': left+'px'
        });
        this.trigger('shown');

        this.setupRequirement('hide');
    },

    setupRequirement: function (type) {
        var requirements = this.model.get('requirements'),
            def;
        if (!_.isUndefined(requirements) && !_.isUndefined(requirements[type])){
            def = requirements[type].call(this);
            if (!_.isUndefined(def)) {
                def.done(_.bind(function () {
                    this.trigger("requirement:"+type);
                }, this));
            }
        }
    },

    hideStep: function () {
        this.$el.css({
            'display': 'none',
            'visibility': 'hidden'
        });
        $('.joyride-modal-bg').hide();
    },

    nextStep: function () {
        this.trigger('next');
    }

});

GZ.Views.Tour = Backbone.Marionette.CollectionView.extend({

    itemView: GZ.Views.TourStep,
    tagName: 'div',
    className: 'joyRideTips',

    currentStep: -1,

    constructor: function () {
        Marionette.CollectionView.prototype.constructor.apply(this, Array.prototype.slice(arguments));

        if (this.steps) {
            this.collection = new Backbone.Collection(this.steps);
        }
    },

    onRender: function () {
        $('body').append(this.$el);
    },

    showStep: function (idx) {
        var newStep = this.children.findByIndex(idx),
            currentStep = this.children.findByIndex(this.currentStep);
        if (!_.isUndefined(newStep)) {
            if (!_.isUndefined(currentStep)) {
                currentStep.hideStep();
            }
            this.currentStep = idx;
            newStep.showStep();
        }
    },

    onItemviewNext: function (view) {
        var nextStep = this.currentStep+1;
        if (!_.isUndefined(this.children.findByIndex(nextStep))) {
            this.showStep(nextStep);
        } else {
            // We're on the last step => closing.
            this.close();
        }
    },

    onItemviewRequirementShow: function (view) {
        var idx = _.indexOf(_.values(this.children._views), view);
        this.showStep(idx);
    },

    onItemviewRequirementHide: function (view) {
        view.hideStep();
    },

    show: function () {
        this.showStep(0);
        Marionette.triggerMethod.call(this, "show");
    },

    onClose: function () {
        $('.joyride-modal-bg').hide();
    }

}, {

    currentTour: undefined,

    startTour: function () {
        this.stopCurrentTour();
        this.currentTour = new this();
        this.currentTour.render();
        this.currentTour.show();
    },

    stopCurrentTour: function () {
        if (!_.isUndefined(this.currentTour)) {
            this.currentTour.close();
        }
    }

});
