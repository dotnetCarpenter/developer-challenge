// Visual scroll bar

;(function($, window, undefined){

    var defaultOptions = {
        observeHeight: true
    };

    var scrollBarSize = (function(){
        var size;
        return function(){
            if (!size)
            {
                var $div = $('<div />')
                               .css({
                                   width: '50px',
                                   height: '50px',
                                   overflow: 'hidden',
                                   position: 'absolute',
                                   top: '-200px',
                                   left: '-200px'
                               })
                               .append($('<div />').css({
                                   height: '100px'
                               }));

                $('body').append($div);

                var w1 = $('div', $div).innerWidth();
                $div.css('overflow-y', 'scroll');
                var w2 = $('div', $div).innerWidth();
                $div.remove();

                size = w1 - w2;
            }
            return size;
        };
    })();

    function ValueObserver () {
        var observer,
            cachedHeight;

        return {
            observe: function(value, callback){
                clearInterval(observer);
                observer = setInterval(function(){
                    var height = value();
                    if (height && cachedHeight != height) {
                        cachedHeight = height;
                        callback(height);
                    }
                }, 250);
            }
        };
    }

    function ScrollBar(elm, options) {
        var $elm = $(elm),
            $verticalBar = $('<div class="jspVerticalBar" />'),
            $capTop = $('<div class="jspCapTop" />'),
            $track = $('<div class="jspTrack" />'),
            $drag = $('<div class="jspDrag" />'),
            height,
            contentHeight,
            scrollTop,
            scrollableHeight,
            trackBufferHeight,
            dragging;

        return {
            init: init,
            update: update,
            setHeight: setHeight,
            setContentHeight: setContentHeight,
            setScrollTop: setScrollTop
        };

        function init() {
            $elm.append(
                $verticalBar.append($capTop)
                            .append($track.append($drag))
            );

            $drag.on('mousedown', startDrag);

            update();
        }

        function update() {
            var overflowFactor = contentHeight / height,
                pct;

            $track.css('height', height);

            if (window.navigator.userAgent.indexOf(' AppleWebKit/') > -1 && window.navigator.userAgent.indexOf(' Mobile/') > -1) {
                // Indicating that scrolling is possible on iOS by showing a bar in full height
                $drag.height(Math.max(20, height));
            } else {
                $drag.height(Math.max(20, height / overflowFactor));
            }

            scrollableHeight  = contentHeight - height;
            trackBufferHeight = height - $drag.height();

            $drag[scrollableHeight <= 0 ? 'hide' : 'show']();

            pct = scrollTop / scrollableHeight;
            if (!dragging) $drag.css('top', pct * trackBufferHeight);
        }

        function setHeight(newHeight) {
            height = newHeight - $capTop.height();
        }

        function setContentHeight(newHeight) {
            contentHeight = newHeight - $capTop.height();
        }

        function setScrollTop(newScrollTop) {
            scrollTop = newScrollTop;
        }

        function startDrag(e) {
            e.stopPropagation();
            e.preventDefault();

            dragging = {
                handleOffset: parseInt($drag.css('top'), 10),
                mouseOffset: {
                    x: e.pageX,
                    y: e.pageY
                }
            };

            $('body').mouseup(stopDrag)
                     .mousemove(drag)
                     .bind('touchmove', drag);

            $(window).mouseleave(stopDrag);
        }

        function drag(e) {
            e.stopPropagation();
            e.preventDefault();

            var mouseDiff = {
                    x: dragging.mouseOffset.x - e.pageX,
                    y: dragging.mouseOffset.y - e.pageY
                },
                newTop = Math.min(Math.max(0, dragging.handleOffset - mouseDiff.y), trackBufferHeight),
                pct = newTop / trackBufferHeight;

            $drag.css('top', newTop);
            if (options.topUpdated) options.topUpdated(pct * scrollableHeight);
        }

        function stopDrag(e) {
            dragging = null;
            $('body').unbind('mouseup', stopDrag)
                     .unbind('mousemove', drag)
                     .unbind('touchmove', drag);
        }
    }

    function CustomScroll(elm, options) {
        var $elm = $(elm),
            scrollAreaClass = 'custom-scroll-area',
            right = -1*scrollBarSize(),
            $scrollArea = $('<div />')
                .attr('class', scrollAreaClass)
                .css({
                    'position': 'absolute',
                    'top': 0,
                    'bottom': 0,
                    'width': 'auto',
                    'overflow-y': 'auto',
                    'overflow-x': 'hidden',
                    '-ms-autohiding-scrollbar': 'none',
                    'left': '0px',
                    'right': right + 'px'
                })
                .on('scroll', updateScroll),
            $scrollAreaContainer = $('<div />')
                .attr('class', scrollAreaClass + '-container')
                .css({
                    'position': 'absolute',
                    'top': 0,
                    'bottom': 0,
                    'overflow': 'hidden',
                    'left': 0,
                    'right': 0
                }),
            scrollBar = new ScrollBar($elm, {
                topUpdated: scrollTopUpdatedCallback
            });

        // Enable native scrolling when we are on iOS version 6 and larger
        if (window.navigator.userAgent.indexOf(' AppleWebKit/') !== -1 &&
            window.navigator.userAgent.indexOf(' Mobile/') !== -1 &&
            window.navigator.userAgent.indexOf(' Version/4') === -1 &&
            window.navigator.userAgent.indexOf(' Version/5') === -1) {
                $scrollArea.css({
                    '-webkit-overflow-scrolling': 'touch'
                });

        }

        $scrollAreaContainer.html($scrollArea);
        $elm.wrapInner($scrollAreaContainer);
        scrollBar.init();

        if (options.observeHeight) {
            new ValueObserver().observe(function () { return $elm.height(); }, updateScroll);
            new ValueObserver().observe(function () {
                var children = $elm.find('.custom-scroll-area').children();
                return children.length*children.height();
            }, updateScroll);
        }

        function scrollTopUpdatedCallback(newTop) {
            var $scrollArea = $elm.find("."+scrollAreaClass);
            $scrollArea.scrollTop(newTop);
        }

        function updateScroll(){
            var $scrollArea = $elm.find("."+scrollAreaClass),
                contentHeight  = $scrollArea[0].scrollHeight;

            scrollBar.setHeight($elm.height());
            scrollBar.setContentHeight(contentHeight);
            scrollBar.setScrollTop($scrollArea.scrollTop());
            scrollBar.update();

            if (options.onBottomReached && options.bottomZoneHeight) {
                var bottomDistance = contentHeight - $elm.height() - $scrollArea.scrollTop();
                if (bottomDistance < options.bottomZoneHeight) {
                    options.onBottomReached(bottomDistance);
                }
            }
        }

        return {
            update: updateScroll
        };
    }

    $.fn.customScroll = function(options){
        return this.each(function(index, elm){
            var $elm = $(elm),
                $scrollAreaContainer = $elm.find('> .custom-scroll-area-container'),
                scroll = $elm.data('custom-scroll');

            if ($scrollAreaContainer.length > 0 && scroll) {
                scroll.update();
            } else {
                $elm.data('custom-scroll', new CustomScroll(this, $.extend({}, defaultOptions, options)));
            }
        });
    };

})(jQuery, window);