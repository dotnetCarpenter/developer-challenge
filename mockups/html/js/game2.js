function define(d3) {

  var ø = {
    compose: function() { 
      "use strict";
      var fns = getArguments.call(arguments);
      var continuation = bind(next, fns);
      continuation.destroy = bind(destroy, fns);
      return continuation;

      function destroy() {
        for(var i = 0, len = this.length; i < len; ++i)
          this[i] = null; // explitly null out references as some host objects doesn't deallocate otherwise (e.g. Titanium)
        this.length = 0;
        //console.log("destroy is called");
      }
      function next(){
        var args = getArguments.call(arguments);
        var currentFn = this.shift();
        if(!currentFn) return;  // done
        currentFn.call(null, continuation, args[0]);
        //console.log("next is called");
      }
      function bind(fn, obj){
        if(fn.bind) return fn.bind(obj);
        else return function() {
          return fn.apply(obj, arguments);
        }
      }
      function getArguments() {
        return Array.prototype.splice.call(this, 0, this.length);
      }
    },
    composeCycle: function() { 
      "use strict";
      var fns = getArguments.call(arguments);
      var counter = { c: 0, max: fns.length };
      var continuation = bind(next, fns);
      continuation.destroy = bind(destroy, fns);
      return continuation;

      function destroy() {
        for(var i = 0, len = this.length; i < len; ++i)
          this[i] = null; // explitly null out references as some host objects doesn't deallocate otherwise (e.g. Titanium)
        this.length = 0;
        //console.log("destroy is called");
      }
      function next(){
        var args = getArguments.call(arguments);
        var currentFn = this[counter.c++ % counter.max];
        currentFn.call(null, continuation, args[0]);
        //console.log("next is called");
      }
      function bind(fn, obj){
        if(fn.bind) return fn.bind(obj);
        else return function() {
          return fn.apply(obj, arguments);
        }
      }
      function getArguments() {
        return Array.prototype.splice.call(this, 0, this.length);
      }
    }
  };

  ø;
}

define(d3);