/**
 * 
 * Commands for Hyperbone View
 *
**/

var dom = require('dom');

function bindCommand(cmd, root, model, value){

	var properties = cmd.get('properties');
	var self = this;

	root.find('[name]').each(function(el){

		var property = el.attr('name');
		var val = properties.get(property);
		el.val(val);

		properties.on('change:' + property, function(val){
			var oldVal = el.val();
			var newVal = properties.get(property);
			if(oldVal !== newVal){
				el.val(newVal);
			}
		});

		el.on('change', function(e){
			var oldVal = properties.get(property);
			var newVal = el.val();

			if(oldVal !== newVal){
				properties.set(property, newVal);
			}

			model.trigger('change:' + value, cmd);

		});

	});

	root.on('submit', function(e){
		e.preventDefault();
		model.trigger('submit:' + value, cmd);
	});

	root.addClass('bound-to-command');

}

module.exports = {

	"attributeHandlers" : {

		"hb-with-command" : function(node, value, cancel){

			var self = this;
			var root = dom(node);
			var cmd = this.model.command(value);

			if(cmd){

				bindCommand(cmd, root, this.model, value);

			} else {

				var recheckCommand = function(){
					var cmd = self.model.command(value);
					if(cmd){
						// don't do this again
						self.model.off('command-found' + value, recheckCommand);
						bindCommand(cmd, root, self.model, value);
					}
				};

				this.model.on('command-found:' + value, recheckCommand);

			}

		},
		"if-command" : function(node, prop, cancel){
			var self = this,
				test = function(){
					dom(node).css({display: ( self.model.command(prop) ? '': 'none') });
				};

				this.model.on('command-found:' + prop, test);
				// do the initial state.
				test();
		}
	}
};