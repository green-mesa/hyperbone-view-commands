# Commands for Hyperbone View

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-view-commands.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-view-commands)

## tl;dr

Basic `_command` to `<form>` bindings for Hyperbone View. This is a lot lot lot more useful than it sounds.

## Introduction

This module is what makes Hyperbone fun and interesting to build applications with, but it's by far the most aggressively opinionated bit of Hyperbone, so it lives in its own handily optional module that you can use or not. 

Commands are additional data that can be added to Hypermedia loaded from a server or added directly to a Hyperbone Model's prototype by a client side programmer. They describe various HTTP actions that manipulate the parent Hypermedia resource in some way. 

This is in contrast to 'active record' style frameworks where models represent resources and you can 'save' or 'update' them - REST level 2 style. In Hyperbone, models represent a resource and `_commands` define ways of manipulating it, and these may go way beyond simple CRUD operations. In this way it supports REST Level 3 - Hypermedia. 

This module allows the developer to bind `_commands` to forms, and bind forms to `_commands` and then exposes some useful Hyperbone events for working with them.

[Hyperbone Models With IO](https://github.com/green-mesa/hyperbone-model-with-io) adds support for 'executing' commands (which means turning it into an http request), but this isn't required to use this module... or commands at all. 

Commands can be used to:

- Programmatically describe and then easily work with non-RESTful, non-hypermedia or not-yet-existing web apis
- Turn forms in your view into discrete, easy to work with chunks of application logic
- Allow a server to clearly define what operations can be performed on any given resource
- Build a client side application before the server side exists by stubbing out commands which form a spec for the as yet unbuilt API.

The basic philosophy is that client side applications tend to need to interact with server side APIs and it's pretty rare that APIs are neat, clean and fit within the active record mold.

## Example

Here we have a home page that can be logged into. Therefore we have a home page resource, and that has a 'login' command.

In this example our command is contained within JSON loaded from the server, but you can just as easily add them to a model's prototype instead.

We've got some HTML in our page. The `hb-with-command="login"` binds that form to a command called login, and 'if-command' means that the whole section is only displayed if the command exists.

Also note that hb-with-command also behaves like an 'if-command' attribute so initially both forms will be hidden.

```html
<section if="loaded" id="homepage">
	<section if-command="login">
		<h3>Login</h3>
		<form hb-with-command="login">
			<label for="email">Email:</label>
			<input name="email" type="email">
			<br>
			<label for="password">Password:</label>
			<input name="password" type="password">
			<br>
			<input type="submit" value="Login"> 
		</form>
	</section>
	<form hb-with-command="logout"><button type="submit">Logout</button></form>
	<p if="logged-in">Hello, {{username}}</p>
</section>
```

We need to do a bit of coding now. Create a homepage model, initialise our view, load our Hypermedia and 

```js
// let's use Hyperbone Model with IO so we can interact with a server..
var Model = require('hyperbone-model-with-io').Model;

// extend hyperbone view with hyperbone view commands...
require('hyperbone-view').use( require('hyperbone-view-commands') );
// and get a reference to our View prototype
var View = require('hyperbone-view').HyperboneView;

// create a model. It only has a bit of data which is setting 'loaded' to false.
var homePageModel = new Model({
		loaded : false
	})
	.url('/home.json');

// Initialise the view. Doesn't matter that we haven't loaded the data yet, the view
// will happily work with what it has..
var view = new View({
	model : homePageModel,
	el : 
});

// set up some event handlers on our model. We want to bind to command 
homePageModel.on({
	'sync' : function(){
		// after loading we want to set loaded to true
		this.set('loaded', true);
	},
	'sync-error' : function(){
		// this event fires if there's a problem loading the hypermedia
		// for this model.
	},
	'submit:login submit:logout' : function( command, execute ){
		// this event fires when someone clicks the submit
		// button on the login form. It's not a DOM event,
		// it's a special hyperbone event.

		this.set('loaded', false);

		// this 'executes' the command, sending the data to the server. 
		// By default, without passing a callback, this will automatically
		// perform a fetch on the parent model because all commands could - and
		// probably do - change the parent resource on the server in some way.
		// you can override this by using your own callback.
		execute();
	},
	'executed:login executed:logout' : function(){
		// this event fires when the command has been successfully executed Rare
	},
	'execution-failed:login execution-failed:logout' : function(){
		// this event fires if a command fails to execute.
	}
});

// finally, do an initial fetch.
homePageModel.fetch();
```

And... we're done. User can now login and logout of our application. 

When we do the initial fetch() for a user that's not logged in we get...

```json
{
	_links : {
		self : {
			href : "/home"
		}
	},
	_commands : {
		login : {
			method : "POST",
			href : "/home/login",
			properties : {
				email : "",
				password : ""
			}
		}
	},
	'logged-in' : false,
	'username' : ""
}
```
And when they fill in the login form and submit, and that command gets executed `/home.json` gets reloaded quietly in the background and this time it gets...

```json
{
	_links : {
		self : {
			href : "/home"
		}
	},
	_commands : {
		logout : {
			method : "POST",
			href : "/home/logout",
			properties : {}
		}
	},
	'logged-in' : true,
	'username' : "Jane Superbloggs"
}
```
The view automatically updates itself, as you'd expect.

## Installing

```sh
$ component install green-mesa/hyperbone-view-commands
```

## Usage

```js
// extend hyperbone view...
require('hyperbone-view').use( require('hyperbone-view-commands') );
// get a reference to the view prototype as normal
var View = require('hyperbone-view').HyperboneView;
```

## Attributes

### hb-with-command="commandname"

Binds an element to a particular command. 

- Any existing values in the command will be propogated to the form inputs.
- All changes made to the form or the command will be reflected in the other. 
- A Hyperbone 'submit:commandname' event is fired when the form is submitted
- A 'bound-to-command' class is added to the form to assist debugging.
- Will listen for hyperbone 'add-command' and 'remove-command' signals so that it can adapt to commands appearing and disappearing over time

### hb-sync-with="attributeintheparentmodel"

After binding a form to a commmand, you can add this attribute to a specific input so that any value for that input is also propaged to an attribute in the parent model.

```html
<select hb-sync-with="type-initials" name="type"></select>
<span>{{type-initials}}:<input type="text" name="reference"></input>
```

In this example, the value of 'type' is also bound to 'type-initials' in the parent model so it can be used for various template related hijinx. 

### if-command="commandname"

Shows or hides an element if the command exists or not.

## if-not-command="commandname"

Shows or hides an element if the command doesn't exist or does.

## Events

### submit:commandname

This fires when the bound form is submitted, before the command is executed. The event handler is passed the command and an execute function (this will only work if you are using Hyperbone model with io, though)

### change:commandname

This fires when a user changes the value of an input field.
 
## Testing

Install testing tools. You probably need PhantomJS on your path.

```back
  $ npm install && npm install -g grunt-cli
```

Run the tests:

```bash
  $ grunt test
```

## License

  MIT
