
describe("suite", function(){



	describe("Environment", function(){

		it("has a working environment", function(){

			should.exist(dom);
			should.exist(useFixture);
			should.exist(fixtures);
			should.exist(Model);
			should.exist(View);
			should.exist(setValueAndTrigger);
			should.exist(require('hyperbone-view-commands'));

		});

	});

	describe("Adding the extensions", function(){

		it("successfully adds extensions", function(){

			View.use(require('hyperbone-view-commands'));

		});

	});

	describe("hb-with-command", function(){

		var HyperboneView = View.HyperboneView;

		it("successfully binds properties to a form", function(){

			var html, m;

			html = dom('<div><form hb-with-command="cmds:do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( m.command('cmds:do-something').get('properties.username') ).to.equal(null);
			expect( m.command('cmds:do-something').get('properties.password') ).to.equal(null);
			
			m.command('cmds:do-something').set('properties.username', "Hello");
			m.command('cmds:do-something').set('properties.password', "World");

			expect( html.find('input[name="username"]').val() ).to.equal("Hello");
			expect( html.find('input[name="password"]').val() ).to.equal("World");

		});

		it("issues a submit:cmds:do-something when user clicks submit", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="cmds:do-something"><input name="username"><input name="password"><input type="submit" id="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.command('cmds:do-something').set('properties.username', 'Hello world');

			m.on('submit:cmds:do-something', function(cmd){
				// verify we're getting the command model back
				expect(cmd.get('properties').get('username')).to.equal('Hello world');
				done();

			});

			simulateClick(html.find('#submit'));

		});

		it("issues a change:cmds:do-something event when the user changes an input value", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="cmds:do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.on('change:cmds:do-something', function(cmd){

				expect(cmd.isHyperbone).to.equal(true);
				done();

			});

			setValueAndTrigger(html.find('[name="username"]'), 'Hello world', 'change');

		});

		it("successfully binds inputs in a form to properties", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="cmds:do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.on('change:cmds:do-something', function( cmd ){

				expect( m.command('cmds:do-something').get('properties.username') ).to.equal("Hello");
				done();
			});

			setValueAndTrigger(html.find('[name="username"]'), "Hello", 'change');


		});


	});


});