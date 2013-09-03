// -- Core objects --

var App = {};
App.Config = null; // bootstrapped in template
App.Views = {};
App.Views.Modals = {};
App.SuperViews = {};
App.Utils = {};

// -- SuperViews --

App.SuperViews.Sheets = {

    currentSheet: 0,
    $sheets: null,
    $navItems: null,

    initializeSheets: function() {
        _.bindAll(this, 'activateIOSSlider');

        this.$sheets = this.$('.sheets section');
        this.$('a.prev,a.next').click(this.prevNext);
        for (var i = 1, n = this.$sheets.length; i < n; i++) {
            this.$('nav ul').append(this.$('nav ul li:eq(0)').clone(true));
        }

        (this.$navItems = this.$('nav ul li'))
            .click(this.navClick)
            .eq(0)
            .addClass('active');

        $(window).load(this.activateIOSSlider);
    },

    activateIOSSlider: function() {
        var height = this.$('.viewport').height(),
            width = this.$('.viewport').width();

        this.$('.viewport').addClass('iosSlider').css('padding-bottom', height+'px')
            .find('.sheets-container').addClass('slider')
            .find('section').addClass('slide');

        this.$('.viewport').iosSlider({
            desktopClickDrag: true,
            responsiveSlideContainer: true,
            snapToChildren: true,
            onSlideChange: this.sheetChanged
        });
    },

    prevNext: function(e) {
        e.preventDefault();
        this.navigate($(e.currentTarget).hasClass('prev') ? -1 : 1);
    },

    navigate: function(direction) {
        var newSheet = this.currentSheet + direction;
        if (newSheet < 0) newSheet = this.$sheets.length - 1;
        else if (newSheet > this.$sheets.length - 1) newSheet = 0;

        this.showSheet(newSheet);
    },

    navClick: function(e) {
        this.showSheet(this.$navItems.index(e.currentTarget));
    },

    showSheet: function(sheet) {
        this.$('.viewport').iosSlider('goToSlide', sheet + 1);
    },

    sheetChanged: function(args) {
        this.$navItems.eq(this.currentSheet).removeClass('active');
        this.currentSheet = args.targetSlideNumber - 1;
        this.$navItems.eq(this.currentSheet).addClass('active');
    }

};

// -- Views --

App.Views.Body = Backbone.View.extend({

    navbar: null,
    timeline: null,
    fairPoints: null,
    liveAction: null,
    social: null,
    leagues: null,
    modals: {
        signIn: null
    },

    initialize: function() {
        this.navbar = new App.Views.Navbar({ el: this.$('.navbar') });
        this.top = new App.Views.Top({ el: this.$('#top') });
        this.timeline = new App.Views.Timeline({ el: this.$('#timeline') });
        this.fairPoints = new App.Views.FairPoints({ el: this.$('#fair-points') });
        this.liveAction = new App.Views.LiveAction({ el: this.$('#live-action') });
        this.social = new App.Views.Social({ el: this.$('#social') });
        this.leagues = new App.Views.Leagues({ el: this.$('#leagues') });
        this.modals.signIn = new App.Views.Modals.SignIn({ el: this.$('#sign-in') });
    }

});

App.Views.Navbar = Backbone.View.extend({

    events: {
        "click a[href^='#']": 'inPageNavClick'
    },

    initialize: function() {
        this.$el.on('activate', _.bind(this.toggleFloat, this));
    },

    inPageNavClick: function (evt) {
        var moveTargetHash = evt.currentTarget.hash,
            moveTarget = $(moveTargetHash),
            offset = 0;
        evt.preventDefault();
        if (moveTarget.length) {
            offset = moveTarget.offset().top;
        }
        $('html, body').animate({
            scrollTop: offset
        }, 300, function () {
            window.location.hash = moveTargetHash;
        });
    },

    toggleFloat: function(event) {
        var activeHref = $(event.target).find('a').attr('href'),
            homeIsActive = (activeHref == '#top');

        this.$el.toggleClass('navbar-fixed-bottom', homeIsActive)
                .toggleClass('navbar-fixed-top', !homeIsActive);
    }

});

App.Views.Top = Backbone.View.extend({

    pitchData: null,
    pitchPlayerTemplate: null,

    initialize: function() {
        _.bindAll(this, 'initPitch');
        this.$('.learn-more').click(this.scrollWindow);
        this.initPitch();
        App.Config.on('change:league', this.initPitch);
    },

    initPitch: function() {
        if (_.isNull(this.pitchData)) {
            this.pitchData = $.parseJSON(this.$('script.pitch-data').text());
            this.pitchPlayerTemplate = _.template(this.$('.pitch script').text());
        }

        var self = this;
        this.$('.pitch .player').remove();
        _.each(this.pitchData[App.Config.get('league')], function(item){
            var playerClass = App.Config.get('league')+'-'+item.club+"-"+item.skin;
            self.$('.pitch').append(
                self.pitchPlayerTemplate({
                    classes: [item.id, playerClass].join(' '),
                    name: item.name
                })
            );
        });
    },

    scrollWindow: function() {
        $('body').animate({
            scrollTop: $(window).height() - parseInt($('body').data('offset'), 10)
        }, 500);
    }

});

App.Views.Timeline = Backbone.View.extend({

    initialize: function() {
        _.bindAll(this);
        this.$('a[href="#timeline-toggle"]').click(this.toggleMatches);

        this.leagueChanged();
        App.Config.on('change:league', this.leagueChanged);
    },

    allMatchesVisible: false,
    matchesLayout: {
        hiddenItemSelector: 'li:not(.always-visible):not(.title)',
        initialized: false,
        containerHeight: void 0,
        itemHeight: void 0
    },

    leagueChanged: function() {
        var $section = this.$('section[data-league-id="' + App.Config.get('league') + '"]');

        if ($section.length === 0) return;

        this.$('section')
            .hide()
            .filter('[data-league-id=' + App.Config.get('league') + ']')
            .show();
    },

    toggleMatches: function(e) {
        if (e) e.preventDefault();

        var self = this;

        if (this.matchesLayout.initialized === false) {
            this.matchesLayout.initialized = true;
            this.matchesLayout.containerHeight = this.$('.matches').height();
            this.matchesLayout.itemHeight = this.$('.matches li').height();
            this.matchesLayout.hiddenItemCount = this.$('.matches .match-list:eq(0) ' + this.matchesLayout.hiddenItemSelector).length;
            this.$('.matches').css('height', this.matchesLayout.containerHeight+'px');
            this.$('.matches li').show();

            // This shit is because the stupid browser animates the height
            // even though I set the transition class after I specify the
            // initial height. Da fuk.
            return _.defer(_.bind(function(){
                this.$('.matches').addClass('transition-prepared');
                this.toggleMatches();
            }, this));
        }

        if (this.allMatchesVisible) {
            this.collapseMatches();
        } else {
            this.expandMatches();
        }

        this.$el.toggleClass('open', !this.allMatchesVisible);
        this.allMatchesVisible = !this.allMatchesVisible;
    },

    collapseMatches: function() {
        var self = this;
        setTimeout(function(){
            self.$('.matches').height(self.matchesLayout.containerHeight);
        }, 200);

        this.$('.matches .match-list').each(function(mlIndex, ml){
            var $selector = $(ml).find(self.matchesLayout.hiddenItemSelector);
            $selector.each(function(index, elm){
                var delay = ($selector.length - index) * 25;
                $(elm).delay(delay).fadeOut(250);
            });
        });
    },

    expandMatches: function() {
        var hiddenItemHeight = this.matchesLayout.hiddenItemCount * this.matchesLayout.itemHeight,
            newHeight = hiddenItemHeight + this.matchesLayout.containerHeight,
            self = this;

        this.$('.matches').height(newHeight);
        this.$('.matches .match-list').each(function(mlIndex, ml){
            $(ml).find(self.matchesLayout.hiddenItemSelector).each(function(index, elm){
                $(elm).fadeOut(0).delay(index*50).fadeIn(500);
            });
        });
    }

});

App.Views.FairPoints = Backbone.View.extend({

    canvas: null,
    $attributesList: null,
    playerListItemTemplate: null,
    attributesList: {
        open: false,
        height: 0
    },

    initialize: function() {
        _.bindAll(this, 'changePlayer', 'toggleAttributesList', 'initAttributesList', 'updateBars', 'reloadData', 'dataLoaded');

        this.playerListItemTemplate = _.template($.trim(this.$('ul.players script').html()));

        this.initCanvas();
        this.reloadData();
        App.Config.on('change:league', this.reloadData);
    },

    reloadData: function() {
        this.loadData(this.dataLoaded);
    },

    loadData: function(callback) {
        $.getJSON(App.Utils.leagueDataPath('fair_points.json'), function(data){
            callback(data);
        });
    },

    dataLoaded: function(data) {
        var self = this,
            $list = this.$('ul.players').empty();

        _.each(data, function(playerData){
            var markup = self.playerListItemTemplate(playerData),
                $item = $(markup);

            $item.data('player-data', playerData);
            $list.append($item);
        });

        $list
            .find('li').click(this.changePlayer)
            .eq(0).addClass('selected');

        this.updateBars();
    },

    initCanvas: function() {
        this.canvas = new App.Views.FairPointsCanvas({ el: this.$('.canvas-container') });
    },

    initAttributesList: function() {
        this.$('a[href="#fair-points-toggle"]')
            .click(this.toggleAttributesList);

        this.$attributesList = this.$('.attributes');
        this.attributesList.height = this.$attributesList.height();
        this.$attributesList.css('height', 0);

        _.defer(_.bind(function(){
            this.$attributesList.addClass('transition-prepared');
        }, this));
    },

    toggleAttributesList: function(e) {
        if (e) e.preventDefault();

        this.attributesList.open = !this.attributesList.open;

        if (this.attributesList.open) this.expandAttributesList();
        else this.collapseAttributesList();

        this.$el.toggleClass('open', this.attributesList.open);
    },

    expandAttributesList: function() {
        this.$attributesList.height(this.attributesList.height);
    },

    collapseAttributesList: function() {
        this.$attributesList.height(0);
    },

    changePlayer: function(e) {
        this.$('li').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        this.updateBars();
    },

    updateBars: function() {
        var data = this.$('li.selected').data('player-data'),
            self = this;

        this.canvas.showBars(data.bars, function(){
            self.updateAttributeList(data);
        });
    },

    updateAttributeList: function(data) {
        var attributesData = _.sortBy(_.union(_.flatten(data.bars), data.expanded), function(item){
                return -item.value;
            });

        this.$('.attributes-resume .attribute').each(function(index, elm){
            var $elm = $(elm),
                barData = data.bars[index];

            if (_.isArray(barData)) {
                var sum = _.reduce(_.pluck(barData, 'value'), function(m, n) {
                    return m + n;
                }, 0);

                $elm.find('.match-icon').attr('class', 'match-icon').addClass('other');
                $elm.find('.title').html(GZ.helpers.i18n.gettext('Other attributes'));
                $elm.find('.earnings span').html(App.Utils.formatMoney(sum, 0));
            } else {
                var label = GZ.helpers.i18n.gettext(barData.label);
                if (_.isNumber(barData.count) && barData.count > 1) {
                    label = [barData.count, '&times; ', label].join('');
                }

                $elm.find('.match-icon').attr('class', 'match-icon').addClass(barData.label.replace(/ /g, '-').toLowerCase());
                $elm.find('.title').html(label);
                $elm.find('.earnings span').html(App.Utils.formatMoney(barData.value, 0));
            }
        });

        var attributeColumns = _.groupBy(attributesData, function(item, idx){
                return Math.floor(idx / this);
            }, Math.ceil(attributesData.length / 3)),
            attributeTemplate = _.template(this.$('.attributes script').html());

        this.$('.attributes .column .attribute').remove();
        this.$('.attributes .column').each(function(index, elm){
            var html, $elm = $(elm);
            _.each(attributeColumns[index], function(item){
                html = attributeTemplate(_.extend({ count: 1 }, item));
                $elm.append(html);
            });
        });

        if (!this.attributesList.height) this.initAttributesList();
    }

});

App.Views.FairPointsCanvas = Backbone.View.extend({

    camera: null,
    scene: null,
    renderer: null,
    dimensions: {
        width: 0,
        height: 0
    },
    bar: {
        width: 110,
        depth: 110,
        maxHeight: 0
    },
    defaultCubeColor: 0xb6c3d4,
    initialAssets: {
        shadowMiddle: '/landing-page/img/shadow-middle.png',
        shadowTop: '/landing-page/img/shadow-top.png',
        shadowBottom: '/landing-page/img/shadow-bottom.png'
    },
    initialAssetsLoaded: false,
    assets: {},
    bars: [],
    shadows: [],

    initialize: function() {
        _.bindAll(this, 'animate', 'animationComplete', 'mouseMoving');

        this.dimensions = {
            width: this.$('.canvas-wrapper').width(),
            height: this.$('.canvas-wrapper').height()
        };
        this.bar.maxHeight = this.dimensions.height;
        this.bar.width = Math.round(this.dimensions.width / 8);
        this.setupScene();
        this.setupRenderer();
        this.setupCamera(this.dimensions.width, this.dimensions.height);
        this.setupLight();

        this.loadAssets(this.initialAssets, _.bind(function(){
            this.initialAssetsLoaded = true;
        }, this));
    },

    setupScene: function() {
        this.scene = new THREE.Scene();
    },

    setupRenderer: function() {
        this.renderer = Detector.webgl ? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer();
        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
        this.$('.canvas-wrapper').append(this.renderer.domElement);

        $(this.renderer.domElement).mousemove(this.mouseMoving);
    },

    setupCamera: function(width, height) {
        this.camera = new THREE.PerspectiveCamera(25, width / height, 1, 2600);
        this.camera.position.set(width / 2, -150, 1000);
    },

    setupLight: function() {
        if (!Detector.webgl) {
            this.addDirectionalLight(1, this.dimensions.width / 3 * 2, 100, 1000);
        }

        this.addSpotLight(0.8, {x:this.dimensions.width,y:this.dimensions.height/2,z:300}, {x:this.dimensions.width/4*3, y:this.dimensions.height/-3*2, z:0});
        this.addSpotLight(0.5, {x:this.dimensions.width,y:this.dimensions.height/2,z:400}, {x:this.dimensions.width/3, y:this.dimensions.height/-2, z:0});
        this.addDirectionalLight(0.4, this.dimensions.width, this.dimensions.height, 100);
        this.addDirectionalLight(0.6, -this.dimensions.width, this.dimensions.height, 0);
        this.addDirectionalLight(1, this.dimensions.width / 3 * 2, 100, 1000);
    },

    addDirectionalLight: function(intensity, x, y, z) {
        var light = new THREE.DirectionalLight(0xffffff, intensity);
        light.position.set(x, y, z);
        this.scene.add(light);
    },

    addSpotLight: function(intensity, pos, target) {
        var light = new THREE.SpotLight(0xffffff, intensity);
        light.position.set(pos.x, pos.y, pos.z);
        light.angle = Math.PI/4;
        light.target.position.set(target.x, target.y, target.z);
        this.scene.add(light);
    },

    loadAssets: function(assets, cb) {
        var assetKeys = _.keys(assets),
            assetLoaded = _.after(assetKeys.length, _.bind(function(){
                if (_.isFunction(cb)) cb();
                this.trigger('assetsLoaded', assets);
            }, this));

        _.each(assets, _.bind(function(url, key){
            this.assets[key] = THREE.ImageUtils.loadTexture(url, null, assetLoaded);
        }, this));
    },

    cubeMaterial: function(color) {
        return new THREE.MeshLambertMaterial({
            color: color || this.defaultCubeColor,
            shading: THREE.FlatShading
        });
    },

    cubeGeometry: function(barHeight) {

        if (!Detector.webgl) {
            return new THREE.CubeGeometry(this.bar.width, barHeight, this.bar.depth);
        }


        var widthSegments = 5,
            heightSegments = Math.ceil(barHeight / (this.bar.width / widthSegments));

        return new THREE.CubeGeometry(this.bar.width, barHeight, this.bar.depth, widthSegments, heightSegments);
    },

    mouseMoving: function(e) {
        var offsetX  = (e.offsetX || e.pageX - $(e.target).offset().left),
            offsetY = (e.offsetY || e.pageY - $(e.target).offset().top);

        this.findIntersectingElements(offsetX, offsetY);
    },

    intersected: null,

    findIntersectingElements: function(x, y) {
        var mouse = {
                x: (x / this.dimensions.width) * 2 - 1,
                y: -(y / this.dimensions.height) * 2 + 1
            },
            vector = new THREE.Vector3(mouse.x, mouse.y, 1),
            projector = new THREE.Projector(),
            raycaster = new THREE.Raycaster();

        projector.unprojectVector(vector, this.camera);

        raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            if (this.intersected == intersects[0].object) return;

            if (this.intersected) {
                this.intersected.material.color.setHex(this.intersected.currentHex);
            }

            this.intersected = intersects[0].object;
            this.intersected.currentHex = this.intersected.material.color.getHex();

            var barData = this.intersected.parent.userData;

            if (barData.label) {

                this.intersected.material.color.setHex(0x611ca1);

                var intVector = this.intersected.parent.position.clone();
                projector.projectVector(intVector, this.camera);

                var parentVector = this.intersected.parent.parent.position.clone();
                projector.projectVector(parentVector, this.camera);

                var _x = (intVector.x + 1) / 2 * this.dimensions.width,
                    _y = (intVector.y + parentVector.y - 1) / -2 * this.dimensions.height + 104,
                    css = {
                        top: _y,
                        left: (_x + this.bar.width / 3 * 2),
                        right: 'auto'
                    };

                if (_x > this.dimensions.width / 2) {
                    css.left = 'auto';
                    css.right = this.dimensions.width - _x + this.bar.width / 3 * 2;
                }

                var label = GZ.helpers.i18n.gettext(barData.label);
                if (_.isNumber(barData.count) && barData.count > 1) {
                    label = [barData.count, '&times; ', label].join('');
                }

                this.$('.tooltip')
                    .show()
                    .css(css)
                    .toggleClass('left-anchor', css.right == 'auto')
                    .find('.label')
                    .html(label)
                    .next()
                    .text((barData.value / 1000) + 'k');
            } else {
                this.$('.tooltip').hide();
            }
        } else {
            if (this.intersected) this.intersected.material.color.setHex(this.intersected.currentHex);

            this.intersected = null;
            this.$('.tooltip').hide();
        }

        this.renderer.render(this.scene, this.camera);
    },

    barValue: function(item) {
        if (_.isArray(item)) {
            return _.reduce(_.pluck(item, 'value'), function(a, b) {
                return a + b;
            }, 0);
        }
        return item.value;
    },

    showBars: function(barsConfig, barsClearedCallback) {
        if (this.initialAssetsLoaded === false) {
            return this.once('assetsLoaded', function(){
                this.showBars(barsConfig, barsClearedCallback);
            }, this);
        }

        this.clearBars(_.bind(function(){

            if (barsClearedCallback) barsClearedCallback();

            var maxValue = this.barValue(_.max(barsConfig, this.barValue));

            _.each(barsConfig, _.bind(function(barConfigs, i){

                if (!_.isArray(barConfigs)) {
                    barConfigs = [barConfigs];
                }

                var n = barConfigs.length - 1,
                    offset = 0,
                    mesh,
                    shadow,
                    bar = new THREE.Object3D();

                bar.position.y = this.dimensions.height * -0.85;
                bar.scale.y = 0.0001;

                for (; n >= 0; n--) {
                    var barConfig = barConfigs[n],
                        posX = this.dimensions.width / barsConfig.length * (i+0.5),
                        barHeight = this.bar.maxHeight / maxValue * this.barValue(barConfig);

                    mesh = this.addBar(barHeight, posX, parseInt(barConfig.color, 16), offset);
                    mesh.userData = barConfig;

                    bar.add(mesh);
                    offset += barHeight;
                }

                shadow = this.createShadow(offset, {
                    x: mesh.position.x,
                    y: offset/2
                });

                this.shadows.push(shadow);

                bar.add(shadow);
                bar.userData = {test:1};

                this.bars.push(bar);
                this.scene.add(bar);

                this.animateBarHeight(bar, 1, this.animationComplete);
                this.fadeShadow(shadow, 1);

            }, this));

            this.renderer.render(this.scene, this.camera);
            this.animationBegun();

        }, this));
    },

    addBar: function(barHeight, posX, color, deltaY) {
        var mesh = new THREE.Mesh(this.cubeGeometry(barHeight), this.cubeMaterial(color)),
            container = new THREE.Object3D();

        container.position.set(posX, barHeight / 2 + deltaY, 0);
        container.add(mesh);

        return container;
    },

    createShadow: function(barHeight, position) {
        var shadowObj = new THREE.Object3D(),
            assetDimensions = {
                top: { width: 112, height: 93 },
                middle: { width: 112 },
                bottom: { width: 220, height: 84 }
            },
            img = new THREE.MeshBasicMaterial({
                map: this.assets.shadowMiddle,
                transparent: true
            }),
            middleHeight = barHeight - assetDimensions.top.height,
            geometry = new THREE.PlaneGeometry(assetDimensions.middle.width, middleHeight, 0),
            mesh = new THREE.Mesh(geometry, img);

        // Stretch (middle) asset
        mesh.position.x = position.x - (assetDimensions.middle.width + this.bar.width) / 2;
        mesh.position.y = position.y - (barHeight - middleHeight) / 2;
        mesh.position.z = this.bar.width / -2;

        shadowObj.add(mesh);

        // Top asset
        img = new THREE.MeshBasicMaterial({
            map: this.assets.shadowTop,
            transparent: true
        });
        var topHeight = Math.min(barHeight, assetDimensions.top.height);
        geometry = new THREE.PlaneGeometry(assetDimensions.top.width, topHeight, 0);
        mesh = new THREE.Mesh(geometry, img);

        mesh.position.x = position.x - (assetDimensions.top.width + this.bar.width) / 2;
        mesh.position.y = position.y + (barHeight - topHeight) / 2;
        mesh.position.z = this.bar.width / -2;

        shadowObj.add(mesh);

        // Bottom asset
        img = new THREE.MeshBasicMaterial({
            map: this.assets.shadowBottom,
            transparent: true
        });
        geometry = new THREE.PlaneGeometry(assetDimensions.bottom.width, assetDimensions.bottom.height, 0);
        mesh = new THREE.Mesh(geometry, img);

        mesh.position.x = position.x + (assetDimensions.bottom.width - this.bar.width) / 2 - assetDimensions.middle.width;
        mesh.position.y = position.y - (barHeight + assetDimensions.bottom.height) / 2;
        mesh.position.z = this.bar.width / -2;

        shadowObj.add(mesh);

        return shadowObj;
    },

    clearBars: function(callback) {
        var self = this;
        var cb = _.debounce(function(){
            self.animationComplete();
            this.bars = _.filter(self.bars, function(bar){
                self.scene.remove(bar);
                return false;
            });
            this.shadows = [];
            if (callback) callback();
        }, 50);

        if (this.bars.length === 0) {
            return cb();
        }

        for (var i = this.bars.length - 1, obj; i >= 0; i--) {
            this.animateBarHeight(this.bars[i], 0, cb);
            this.fadeShadow(this.shadows[i], 0);
        }

        this.animationBegun();
    },

    animationDuration: {
        hide: 200,
        show: 350
    },

    animateBarHeight: function(bar, target, cb) {
        var self = this;

        $('<div/>')
            .css('height', 100)
            .animate({
                height: 0
            }, {
                duration: this.animationDuration[target ? 'show' : 'hide'],
                easing: "easeInOutCubic",
                step: function(height, options){
                    var newScale = (100 - height) / 100;
                    if (target === 0) {
                        newScale = height / 100;
                    }
                    bar.scale.y = Math.max(0.0001, newScale);
                },
                complete: function() {
                    if (cb) cb();
                }
            });
    },

    fadeShadow: function(shadow, target) {
        $('<div/>')
            .css('opacity', target ? 0 : 1)
            .animate({
                opacity: target
            }, {
                duration: this.animationDuration[target ? 'show' : 'hide'],
                easing: "easeInOutCubic",
                step: function(opacity, options){
                    _.each(shadow.children, function(child){
                        child.material.opacity = opacity;
                    });
                }
            });
    },

    animationInProgress: true,
    animationBeginTime: 0,

    animate: function() {
        if (!this.animationInProgress) return;
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    },

    animationBegun: function() {
        this.animationInProgress = true;
        this.animate();
    },

    animationComplete: function() {
        this.animationInProgress = false;
    }

});

App.Views.LiveAction = Backbone.View.extend(_.extend(App.SuperViews.Sheets, {

    $listContainer: null,
    $listItems: null,
    listItemHeight: 0,
    overflow: 0,
    maxScroll: 0,

    initialize: function() {
        _.bindAll(this, 'checkOffset', 'initiateAnimation', 'scrollListItems', 'loadData', 'dataLoaded', 'reloadData');

        this.reloadData();
        App.Config.on('change:league', this.reloadData);
    },

    reloadData: function() {
        this.loadData(this.dataLoaded);
    },

    loadData: function(callback) {
        $.getJSON(App.Utils.leagueDataPath('player_actions.json'), function(data){
            callback(data);
        });
    },

    dataLoaded: function(data) {
        this.$listContainer = this.$('.feed ul').empty();

        var self = this,
            tpl = _.template(this.$('.feed script').text());

        _.each(data, function(item){
            item.formattedValue = (item.value < 0 ? '-' : '+') + App.Utils.formatMoney(item.value, 0);
            self.$listContainer.prepend(tpl(item));
        });

        this.$listItems = this.$listContainer.find('li');
        this.listItemHeight = this.$listItems.outerHeight(true);

        this.$('.feed ul').css('max-height', Math.round(($(window).height() * 0.67) / this.listItemHeight) * this.listItemHeight);
        this.calculateScrollProperties();

        $(window).scroll(this.checkOffset);
    },

    calculateScrollProperties: function() {
        var liHeight = this.$listItems.length * this.listItemHeight,
            overflow = liHeight - this.$('.feed ul').height();

        this.overflow = overflow;
    },

    checkOffset: function() {
        var offset = $(window).scrollTop() + $(window).height(),
            currentScroll = offset - this.$el.offset().top;

        if (currentScroll > 0) this.initiateAnimation();
    },

    initiateAnimation: _.once(function() {
        this.$('.feed ul').scrollTop(this.overflow);
        this.scrollListItems();
    }),

    scrollListItems: function() {
        var scrollTop = this.$('.feed ul').scrollTop() - this.listItemHeight;

        this.$('.feed ul').animate({
            scrollTop: scrollTop
        }, 100);

        if (scrollTop > 0) setTimeout(this.scrollListItems, Math.round(Math.random()*500+1000));
    },

    windowScrolls: function(e) {
        var offset = $(window).scrollTop() + $(window).height(),
            currentScroll = offset - this.$el.offset().top,
            pct = 1 - currentScroll / this.maxScroll;

        if (pct > 1 || pct < 0) return;

        this.$('.feed ul').animate({
            scrollTop: Math.round(this.overflow * pct / this.listItemHeight) * this.listItemHeight
        }, 100);
    }

}));

App.Views.Social = Backbone.View.extend(_.extend(App.SuperViews.Sheets, {

    initialize: function() {
        _.bindAll(this);
        this.initializeSheets();
    }

}));

App.Views.Leagues = Backbone.View.extend(_.extend(App.SuperViews.Sheets, {

    initialize: function() {
        _.bindAll(this);
        this.initializeSheets();
        this.$('section').mousedown(this.changeLeague);

        App.Config.on('change:league', this.leagueChanged);
        this.setActiveLeague(App.Config.get('league'));
    },

    changeLeague: function(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass('inactive')) {
            var $small = $target.find('small');
            $small.css('color', '#fff');
            setTimeout(function(){
                $small.css('color', '');
            }, 500);
            return;
        }

        $('html, body').animate({
            scrollTop: $('#timeline').offset().top
        }, 400, function () {
            App.Config.set('league', $target.data('id'));
        });
    },

    leagueChanged: function(model, newLeague) {
        this.setActiveLeague(newLeague);
    },

    setActiveLeague: function(leagueId) {
        this.$('section')
            .removeClass('active')
            .filter('[data-id=' + leagueId + ']')
            .addClass('active');
    }

}));

App.Views.Modals.SignIn = Backbone.View.extend({

    events: {
        'click .action-lost-password': 'onLostPassword',
        'submit #um-lost-password': 'onLostPasswordSubmit',
        'click .action-lostpassword-back': 'onLostPasswordBack',
        'submit #um-sign-in': 'onLoginSubmit'
    },

    initialize: function() {
        this.$el.on('hide', _.bind(this.modalHidden, this));
        this.$('#um-sign-in').on('show', _.bind(this.formShown, this));
    },

    modalHidden: function () {
        this.$('#lost-password-modal').addClass('hide');
        this.$('#sign-in-modal').removeClass('hide');
        this.$('#um-sign-in').removeClass('in');
        this.$('#um-sign-in').css('height', '0px');
    },

    formShown: function() {
        this.$('#um-sign-in input:eq(0)').focus();
    },

    onLoginSubmit: function (evt) {
        var $form = $('#um-sign-in');
        evt.preventDefault();
        this.lockDownForm($form);
        $.post('/api/login', {
                username: this.$('#inputEmail').val(),
                password: this.$('#inputPassword').val()
            })
            .done(_.bind(function (data) {
                window.location = '/game/';
            }, this))
            .fail(_.bind(function (xhr) {
                var errors = this.parseAPIErrors(xhr.responseText);
                this.displayFormErrors($form, errors);
            }, this));
    },

    onLostPassword: function (evt) {
        evt.preventDefault();
        this.$('#sign-in-modal').addClass('hide');
        this.$('#lost-password-modal').removeClass('hide');
        this.$('#inputEmailLostPassword').val('').focus();
    },

    onLostPasswordSubmit: function (evt) {
        var $form = $('#um-lost-password'),
            email = this.$('#inputEmailLostPassword').val();
        evt.preventDefault();
        this.lockDownForm($form);
        $.post('/api/lostpassword', { email: email })
            .done(_.bind(function (data) {
                $form.find('.control-group').addClass('success');
                $form.find('.help-block').html(GZ.helpers.i18n.gettext('We have sent you a new password to your e-mail.')+"<br>"+GZ.helpers.i18n.gettext('Go check your mailbox!'));
                $form.find('button[type=submit]').removeAttr('disabled');
                $form.find('button[type=submit]').html($form.find('button[type=submit]').data('old-value'));
            }, this))
            .fail(_.bind(function (xhr) {
                var errors = this.parseAPIErrors(xhr.responseText);
                this.displayFormErrors($form, errors);
            }, this));
    },

    lockDownForm: function ($form) {
        $form.find('.control-group').removeClass('success error');
        $form.find('.help-block').html("");
        $form.find('button[type=submit]').attr('disabled', 'disabled');
        $form.find('button[type=submit]').data('old-value', $form.find('button[type=submit]').html());
        $form.find('button[type=submit]').html(GZ.helpers.i18n.gettext('Loading'));
    },

    displayFormErrors: function ($form, errors) {
        $form.find('.control-group').addClass('error');
        _.each(errors, function (error, field) {
            var $hb = $form.find('input[name='+field+']').siblings('.help-block');
            $hb.html(error);
        });
        $form.find('button[type=submit]').removeAttr('disabled');
        $form.find('button[type=submit]').html($form.find('button[type=submit]').data('old-value'));
    },

    onLostPasswordBack: function (evt) {
        evt.preventDefault();
        this.$('#lost-password-modal').addClass('hide');
        this.$('#sign-in-modal').removeClass('hide');
        this.formShown();
    },

    parseAPIErrors: function (responseText) {
        var data = JSON.parse(responseText),
            error = {};
        if (data.status == "error") {
            errors = _.reduce(data.errors, _.bind(function (memo, errors, field) {
                if (!memo[field]) {
                    memo[field] = this.decodeError(field, errors[0].code);
                }
                return memo;
            }, this), {});
        }
        return errors;
    },

    decodeError: function (field, code) {
        var errors = {
            'username:MISSING_KEY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'username:MISSINGKEY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'username:CANNOT_BE_EMPTY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'username:TOOSHORT': GZ.helpers.i18n.gettext('The e-mail is too short.'),
            'username:NOT_FOUND': GZ.helpers.i18n.gettext('The e-mail was not found.'),

            'password:MISSING_KEY': GZ.helpers.i18n.gettext('The password cannot be empty.'),
            'password:MISSINGKEY': GZ.helpers.i18n.gettext('The password cannot be empty.'),
            'password:CANNOT_BE_EMPTY': GZ.helpers.i18n.gettext('The password cannot be empty.'),
            'password:TOOSHORT': GZ.helpers.i18n.gettext('The password is too short.'),
            'password:NOT_FOUND': GZ.helpers.i18n.gettext('The password was not found.'),

            'email:MISSING_KEY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'email:MISSINGKEY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'email:CANNOT_BE_EMPTY': GZ.helpers.i18n.gettext('The e-mail cannot be empty.'),
            'email:TOOSHORT': GZ.helpers.i18n.gettext('The e-mail is too short.'),
            'email:NOT_FOUND': GZ.helpers.i18n.gettext('The e-mail was not found.')
        };
        return errors[field+":"+code] || "Crap, "+field+", "+code;
    }


});

// -- App methods --

// App.store
// Key/value storage
// -
// Get: App.store('key')
// Set: App.store('key', { prop: 1 })
//
App.store = (function(){
    var store = {};

    function get(key) {
        if (_.has(store, key)) {
            return store[key];
        }
        return null;
    }

    function set(key, object) {
        if (_.has(store, key)) {
            throw new Error('App already stores an object for key: ' + key);
        }

        store[key] = object;
        return true;
    }

    return function(key, object) {
        if (_.isUndefined(object)) {
            return get(key);
        }
        return set(key, object);
    };
})();

// -- Bootstrap app --

$(function(){

    App.store('body', new App.Views.Body({ el: 'body' }));

});

// -- WebGL detector --

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

    canvas: !! window.CanvasRenderingContext2D,
    webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
    workers: !! window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    getWebGLErrorMessage: function () {

        var element = document.createElement( 'div' );
        element.id = 'webgl-error-message';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        if ( ! this.webgl ) {

            element.innerHTML = window.WebGLRenderingContext ? [
                'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
                'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
            ].join( '\n' ) : [
                'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
                'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
            ].join( '\n' );

        }

        return element;

    },

    addGetWebGLMessage: function ( parameters ) {

        var parent, id, element;

        parameters = parameters || {};

        parent = parameters.parent !== undefined ? parameters.parent : document.body;
        id = parameters.id !== undefined ? parameters.id : 'oldie';

        element = Detector.getWebGLErrorMessage();
        element.id = id;

        parent.appendChild( element );

    }

};

// -- Number formatter --
App.Utils.formatMoney = function(n, decPlaces) {
    var sign, i, j;
    decPlaces = Math.abs(decPlaces);
    decPlaces = isNaN(decPlaces) ? 2 : decPlaces;
    decSeparator = GZ.helpers.i18n.getSeparators().decimal;
    thouSeparator = GZ.helpers.i18n.getSeparators().normal;
    sign = n < 0 ? "-" : "";
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces), 10) + "";
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

App.Utils.leagueDataPath = function() {
    var basePath = [
            App.Config.get('fileRoot'),
            'league-data',
            App.Config.get('league')
        ],
        requestPath = Array.prototype.slice.call(arguments, 0);

    return _.union(basePath, requestPath).join('/');
};

_.templateSettings = {
    evaluate    : /<\$([\s\S]+?)\$>/g,
    interpolate : /<\$=([\s\S]+?)\$>/g,
    escape      : /<\$-([\s\S]+?)\$>/g
};