var fixtures = {
	'simple' : {
		_links : {
			self : {
				href : '/simple'
			},
			"cmds:do-something" : {
				href : "#_commands/edit/do-something"
			}
		},
		_commands : {
			edit : {
				"do-something" : {
					href : '/simple/something',
					method : 'POST',
					properties : {
						"username" : "",
						"password" : ""
					}
				}
			}
		}
	},
};