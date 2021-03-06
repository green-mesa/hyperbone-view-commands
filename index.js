/**
 * 
 * Commands for Hyperbone View
 *
**/

var dom = require('dom');

function bindCommand(cmd, root, model, value){

	var properties = cmd.get('properties');
	var self = this;

	root.find('[if-property]').each(function(el){

		var property = el.attr('if-property');

		var test = function(){
			el.css({display: ( properties.attributes.hasOwnProperty(property) ? '': 'none') });	
		}

		properties.on('change:' + property, test);

		test();

	});

	root.find('[name]').each(function(el){

		var property = el.attr('name'), sync, schema;

		if (schema = cmd.get('schema')){

			if (el.is('select') && schema.get(property + ".options")){
				// clear any existing child options. Scheme overrides all the things.
				el.empty();
				cmd.get('schema.' + property + ".options").each(function(option){
					el.els[0].appendChild(dom('<option value="' + option.get('value')+ '">' + option.get('name') + '</option>').els[0]);
				});
			}

			if (schema.get(property + ".required")){
				el.attr('required', 'required');
				var label = root.find('label[for="' + property + '"]');
				if (label.length()){
					label.addClass('required');
				}		
			}

			if (schema.get(property + ".disabled")){
				el.attr('disabled', 'disabled');	
			} else {
				el.removeAttr("disabled");
			}

			if (schema.get(property + ".type") === "html-checkbox"){
				var valueAttribute = cmd.get('schema.' + property + ".value");

				if (valueAttribute){
					el.attr('value', valueAttribute);
				}
			}

		}

		var val = properties.get(property);
		el.val(val);


		if (el.attr('type') === 'file'){

			if (!cmd._files){
				cmd._files = {};
			}

			el.on('change', function(e){
				var file = el.els[0].files[0];
				cmd._files[property] = file;

				properties.set(property, el.val());
				
				model.trigger('change:' + value, file, cmd);

			});

		} else {

			properties.on('change:' + property, function(val){
				var oldVal = el.val();
				var newVal = properties.get(property);
				if (oldVal !== newVal){
					el.val(newVal);
				}
			});

			el.on('change', function(e){
				var oldVal = properties.get(property);
				var newVal = el.val();

				if (oldVal !== newVal){
					properties.set(property, newVal);
				}

				model.trigger('change:' + value, cmd);

			});

		}
		// bind a particular input to an attribute on the parent model
		if (sync = el.attr('hb-sync-with')){ // assignment on purpose. do not fix.
			properties.on('change:' + property, function(properties, val){
				model.set(sync, val);
			});
		}

	});

	root.on('submit', function(e){
		e.preventDefault();
		model.trigger('submit:' + value, cmd, function(callback){model.execute(value, callback); });
	});

	root.addClass('bound-to-command');
	root.__isBound = true;

}

function unBindCommand(cmd, root, model, value){

	root.find('[name]').each(function(el){

		el.off('change');

	});

	root.off('submit');
	root.removeClass('bound-to-command');
	root.__isBound = false;
}

module.exports = {

	"attributeHandlers" : {

		"hb-with-command" : function(node, value, cancel){

			var self = this;
			var root = dom(node);
			var showHide = true;

			if (node.getAttribute('if') || node.getAttribute('if-not')) showHide = false;


			var checkCommand = function(){
				var cmd = self.model.command(value);
				if (cmd && !root.__isBound){
					// bind or rebind the form to the command
					// this has to happen every time 'add-command' is called
					// because the command will be a completely different model
					// in the parent model and thus all the old events bound
					// won't work
					bindCommand(cmd, root, self.model, value);
				} else if (!cmd && root.__isBound) {
					// unbind if the command has been removed. We only
					// care about clearing down the DOM events here though
					unBindCommand(cmd, root, self.model, value);
				}
				// hide forms bound to non-existent commands
				if (showHide) dom(node).css({display: ( cmd ? '': 'none') });
			};
			// bind to add and remove command events to make this turn on and offable and deal
			// with commands loaded from a server after teh view initialised.
			this.model.on('add-command:' + value + " remove-command:" + value, checkCommand);
			
			checkCommand();

		},
		// brings 'if' to commands
		"if-command" : function(node, prop, cancel){
			var self = this,
				test = function(){
					dom(node).css({display: ( self.model.command(prop) ? '': 'none') });
				};

				this.model.on('add-command:' + prop + " remove-command:" + prop, test);
				// do the initial state.
				test();
		},
		// brings 'if-not' to commands
		"if-not-command" : function(node, prop, cancel){
				var self = this,
				test = function(){
					dom(node).css({display: ( self.model.command(prop) ? 'none': '') });
				};

				this.model.on('add-command:' + prop + " remove-command:" + prop, test);
				// do the initial state.
				test();		
		}
	}
};