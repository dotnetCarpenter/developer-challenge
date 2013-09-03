(function(GZ, Backbone){

    var apiKey = "AxGe5j5WSRyWmwn428a7wz";

    function load() {
        (function(a){
            if(window.filepicker){
                return;
            }
            var b=a.createElement("script");
            b.type="text/javascript";
            b.async=!0;
            b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";
            var c=a.getElementsByTagName("script")[0];
            c.parentNode.insertBefore(b,c);
            var d={};
            d._queue=[];
            var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");
            var f=function(a,b){
                return function(){
                    b.push([a,arguments]);
                };
            };
            for(var g=0;g<e.length;g++){
                d[e[g]]=f(e[g],d._queue);
            }
            window.filepicker=d;

            filepicker.setKey(apiKey);
        })(document);
    }

    function takePicture(containerId) {
        var d = new $.Deferred(),
            options = {
                mimetypes: ['image/*'],
                container: containerId,
                services:['WEBCAM']};
        filepicker.pick(options,
            function (file) {
                d.resolve(file);
            }, function (fperror) {
                d.reject(fperror);
            });
        return d.promise();
    }

    function upload(input) {
        var d = new $.Deferred();
        filepicker.store(input,
            function (file) {
                d.resolve(file);
            }, function (fperror) {
                d.reject(fperror);
            }, function (progress) {
                d.notify(progress);
            });
        return d.promise();
    }

    function stat(file, options) {
        var d = new $.Deferred();
        filepicker.stat(file, options,
            function (stat) {
                file = _.extend(file, stat);
                d.resolve(file);
            }, function (fperror) {
                d.reject(fperror);
            });
        return d.promise();
    }

    function crop(file, options) {
        var d = new $.Deferred();
        filepicker.convert(file, options,
            function (file) {
                d.resolve(file);
            }, function (fperror) {
                d.reject(fperror);
            }, function (progress) {
                d.notify(progress);
            });
        return d.promise();
    }

    GZ.app.on("initialize:after", load);

    GZ.helpers.filepicker = {
        'takePicture': takePicture,
        'upload': upload,
        'stat': stat,
        'crop': crop
    };

})(GZ, Backbone);