
describe("suite", function(){



	describe("Environment", function(){

		it("has a working environment", function(){

			should.exist(dom);
			should.exist(useFixture);
			should.exist(fixtures);
			should.exist(Model);
			should.exist(setValueAndTrigger);
			should.exist(require('hyperbone-view-commands'));

		})

	})

});