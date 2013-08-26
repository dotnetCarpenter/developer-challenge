(function($){

    function construct(settings) {
        var allID = this.selector.replace(/#/g, "").replace(/\s|\:/g, "_") + "_fixedheader",
            configKey = 'fixedHeaderConfig';

        return this.each(function(index, table) {
            if (!table.tHead || table.tBodies.length === 0) { return; }

            var c = $(table).data(configKey);
            if (!c) {
                $(table).data(configKey, c = $.extend(true, {}, $.fixedheader.defaults, settings));
            }

            var orgTable = $(table), 
                orgHead = $(table.tHead),
                newTable;

            function draw() {
                var cloneHead = orgHead.clone().css('visibility', 'visible'),
                    containerOffset = c.container.offset(),
                    offset = orgTable.offset();

                cloneHead.on("click mousedown mouseup", "th", function(e) {
                    var idx = $(this).index(), 
                        orgTH = orgHead.find("th").eq(idx);

                    orgTH.trigger(e);
                });

                if (_.isUndefined(newTable)) {
                    newTable = $("<table>");
                    newTable.append(cloneHead);

                    var top = (c.calculateOffset ? offset.top - containerOffset.top + c.offset.top : c.offset.top),
                        left = (c.calculateOffset ? offset.left - containerOffset.left + c.offset.left : c.offset.left);

                    newTable.attr({
                        'class': orgTable.attr('class') + ' table_header_fixed',
                        'id': allID
                    });
                    newTable.css({
                        width: orgTable.width(),
                        top: top,
                        left: left
                    });

                    orgHead.css({
                        visibility: "hidden"
                    });

                    newTable.appendTo(c.container);
                } else {
                    newTable.html(cloneHead);
                }
            }

            orgTable.on('sortEnd update', draw);
            draw();
        });
    }


    function Plugin() {
        this.version = "0.1";
        
        this.defaults = {
            container: $(document.body),
            offset: { top: 0, left: 0 },
            calculateOffset: true
        };
    }
    $.extend(Plugin.prototype, {
        version: "0.1",
        
        defaults: {},
        construct: construct
    });


    $.extend({
        fixedheader: new Plugin()
    });

    // extend plugin scope
    $.fn.extend({
        fixedheader: $.fixedheader.construct
    });

})(jQuery);