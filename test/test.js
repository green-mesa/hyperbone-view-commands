
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

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( m.command('do-something').get('properties.username') ).to.equal('');
			expect( m.command('do-something').get('properties.password') ).to.equal('');
			
			m.command('do-something').set('properties.username', "Hello");
			m.command('do-something').set('properties.password', "World");

			expect( html.find('input[name="username"]').val() ).to.equal("Hello");
			expect( html.find('input[name="password"]').val() ).to.equal("World");

		});

		it("issues a submit:cmds:do-something when user clicks submit", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" id="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.command('do-something').set('properties.username', 'Hello world');

			m.on('submit:do-something', function(cmd){
				// verify we're getting the command model back
				expect(cmd.get('properties').get('username')).to.equal('Hello world');
				done();

			});

			simulateClick(html.find('#submit'));

		});

		it("issues a change:do-something event when the user changes an input value", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.on('change:do-something', function(cmd){

				expect(cmd.isHyperbone).to.equal(true);
				done();

			});

			setValueAndTrigger(html.find('[name="username"]'), 'Hello world', 'change');

		});

		it("successfully binds inputs in a form to properties", function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			m.on('change:do-something', function( cmd ){

				expect( m.command('do-something').get('properties.username') ).to.equal("Hello");
				done();
			});

			setValueAndTrigger(html.find('[name="username"]'), "Hello", 'change');

		});

		it('can populate the options of a select with an appropriate schema', function(){

			var html, m;

			html = dom('<div><form hb-with-command="with-select"><select name="select-input"></select></form></div>');

			m = new Model({
				_commands : {
					'with-select' : {
						href : "/",
						method : "POST",
						properties : {
							'select-input' : '1'
						},
						schema : {
							'select-input' : {
								options : [
									{
										name : 'One',
										value : '1'
									},
									{
										name : 'Two',
										value : '2'
									},
									{
										name : 'Three',
										value : '3'
									}
								]
							}
						}

					}
				}
			});

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( html.find('option').length() ).to.equal(3);
			expect( html.find('option').first().els[0].selected ).to.equal(true);
			expect( html.find('option').first().attr('value')).to.equal('1');
			expect( html.find('option').first().text() ).to.equal('One');

			expect( html.find('option').at(1).els[0].selected ).to.equal(false);
			expect( html.find('option').at(1).attr('value')).to.equal('2');
			expect( html.find('option').at(1).text() ).to.equal('Two');

			expect( html.find('option').at(2).els[0].selected ).to.equal(false);
			expect( html.find('option').at(2).attr('value')).to.equal('3');
			expect( html.find('option').at(2).text() ).to.equal('Three');	

		})

		describe('hb-sync-with', function(){

			it('can synchronise a command property with an attribute on the parent model', function( done ){

				var html, m;

				html = dom('<div><form hb-with-command="do-something"><input name="username" hb-sync-with="username"><input name="password"><input type="submit" value="Submit"></form></div>');

				m = new Model( useFixture('simple') );

				new HyperboneView({
					model : m,
					el : html.els[0]
				});

				m.on('change:username', function( cmd ){

					expect( m.get('username') ).to.equal('Transformed');
					done();
				});

				setValueAndTrigger(html.find('[name="username"]'), "Transformed", 'change');


			});

		});

	});

	describe('Async hb-with-command', function(){

		var HyperboneView = View.HyperboneView;

		it('can bind to a command that appears after view initialised', function(){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			// no command yet...
			m = new Model({});

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			// first, the form should be hidden
			expect( html.find('form').els[0].style.display ).to.equal('none');
			expect( html.find('form').is('.bound-to-command')).to.equal(false);

			// now we add the command to teh model with a reinit
			m.reinit( useFixture('simple') );

			expect( html.find('form').els[0].style.display ).to.not.equal('none');
			expect( html.find('form').is('.bound-to-command') ).to.equal(true);

		});

		it('can unbind a form if the command disappears', function(){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			// no command yet...
			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( html.find('form').els[0].style.display ).to.not.equal('none');
			expect( html.find('form').is('.bound-to-command') ).to.equal(true);

			// first, the form should be hidde

			// now we add the command to teh model with a reinit
			m.reinit({
				_commands : {}
			});

			expect( html.find('form').els[0].style.display ).to.equal('none');
			expect( html.find('form').is('.bound-to-command')).to.equal(false);


		});


		it('can bind, unbind, rebind...', function( done ){

			var html, m;

			html = dom('<div><form hb-with-command="do-something"><input name="username"><input name="password"><input type="submit" value="Submit"></form></div>');

			// no command yet...
			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( html.find('form').els[0].style.display ).to.not.equal('none');
			expect( html.find('form').is('.bound-to-command') ).to.equal(true);

			// first, the form should be hidde

			// now we add the command to teh model with a reinit
			m.reinit({
				_commands : {}
			});

			expect( html.find('form').els[0].style.display ).to.equal('none');
			expect( html.find('form').is('.bound-to-command')).to.equal(false);

			m.reinit(useFixture('simple'));

			expect( html.find('form').els[0].style.display ).to.not.equal('none');
			expect( html.find('form').is('.bound-to-command') ).to.equal(true);	
				
			m.on('change:do-something', function(cmd){

				expect(cmd.isHyperbone).to.equal(true);
				done();

			});

			setValueAndTrigger(html.find('[name="username"]'), 'Hello world', 'change');

		});

	});

	describe("if-command and if-not-command", function(){

		var HyperboneView = View.HyperboneView;

		it('Hides and shows an element correctly if a command exists or not', function(){


			var html, m;

			html = dom('<div><p if-command="do-something">Do something command exists!</div>');

			// no command yet...
			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( html.find('p').els[0].style.display ).to.not.equal('none');

			m.reinit({
				_commands : {}
			});

			expect( html.find('p').els[0].style.display ).to.equal('none');

			m.reinit( useFixture('simple'));

			expect( html.find('p').els[0].style.display ).to.not.equal('none');

		});

		it('Hides and shows an element correctly if a command exists or not', function(){


			var html, m;

			html = dom('<div><p if-not-command="do-something">Do Something command doesn\'t exist!</div>');

			// no command yet...
			m = new Model( useFixture('simple') );

			new HyperboneView({
				model : m,
				el : html.els[0]
			});

			expect( html.find('p').els[0].style.display ).to.equal('none');

			m.reinit({
				_commands : {}
			});

			expect( html.find('p').els[0].style.display ).to.not.equal('none');

			m.reinit( useFixture('simple'));

			expect( html.find('p').els[0].style.display ).to.equal('none');

		});

	});


});