define(['handlebars', '../../js/lib/view-helper'], function(Handlebars) {
  describe("Custom Handlebars Helpers", function() {
    var helpers = Handlebars.helpers;

console.log("Custom Handlebars Helpers", Handlebars.helpers);

    describe( 'The "select" markup helper', function() {
        it ( 'should be registered', function() {
            expect( helpers.select ).toBeDefined();
        });
    });
  });
});