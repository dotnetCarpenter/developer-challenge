define(['handlebars', '../../js/lib/view-helper'], function(Handlebars) {
  describe("Custom Handlebars Helpers", function() {
    var helpers = Handlebars.helpers;

console.log("Custom Handlebars Helpers", Handlebars.helpers);

    describe( 'The "select" markup helper', function() {
        it( 'should be registered', function() {
            expect( helpers.select ).toBeDefined();
        });

        it( 'should return an empty <select> if no arguments', function() {
          var expected = "<select></select>";
          var actual = helpers.select();
          expect( actual ).toEqual( expected );
        });

        it( 'should return a <select> with exactly 1 <option> if given 1 pair', function() {
          var expected = "<select><option value='Hej'>Bo</option></select>";
          var actual = helpers.select([[ "Bo", "Hej"]]);
          expect( actual ).toEqual( expected );
        });

        it( 'should return a <select> with exactly 3 <option> if given 3 pairs', function() {
          var expected = "<select><option value='Hej'>Bo</option><option value='Hej'>Bo</option><option value='Hej'>æøå</option></select>";
          var actual = helpers.select([[ "Bo", "Hej"], [ "Bo", "Hej"], [ "æøå", "Hej"]]);
          expect( actual ).toEqual( expected );
        });
    });
  });
});