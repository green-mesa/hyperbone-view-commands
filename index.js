/**
 * 
 * Commands for Hyperbone View
 *
**/

var dom = require('dom');

module.exports = {

	"attributeHandlers" : {

		"hb-with-command" : function(node, value, cancel){

			var root = dom(node);
			var cmd = this.model.command(value);
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

				});

			});

			root.on('submit', function(e){
				e.preventDefault();
				self.model.trigger('submit:' + value, cmd);
			})

		},

		"hb-command-auto" : function(node, value, cancel){

	    },

		"hb-bind-command" : function(node, value, cancel){

		}
	}
}