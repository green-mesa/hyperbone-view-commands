var fixtures = {
	'simple' : {
		_links : {
			self : {
				href : '/simple'
			}
		},
		_commands : {
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
};