# Commands for Hyperbone View

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-view-commands.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-view-commands)

## tldr; 

Add some `_commands` to your hypermedia document. Add a form to your HTML. Bind the form to the command with this extension to Hyperbone View. Congratulations, your REST has reached level 3.

## Introduction

Hyperbone View lets you bind Hyperbone Models to your DOM in the classic Backbone sort of way, but in our particular use-case every resource has a number of associated actions that can be performed on it that manipulate the resource in some way.

To give an example, we have some hypermedia that represents a publication, and the operations we can perform on that publication are to edit it, delete it, add a new document to it, add an existing document to it, remove a document, add a contributor etc, remove a contributor and so on. 

Each of these actions can (and often do) have completely unique and unpredictable uris. At this point simple CRUD operations can fall short.

`_commands` make these actions discoverable. Each command, at the most basic level (and minimal level), they describe the uri, the HTTP method, preferred encoding and any properties that the server expects. Consider it like a JSON representation of what would be transferred from the browser to the server rather than a JSON representation of a form. 

Commands can be extended with a schema that describe, in more detail, what the server expects - validation, type information etc, but this is optional. 

This extension for Hyperbone View adds the ability to bind HTML Forms in your Views to specific commands in your Hypermedia. It can even generate basic forms for you, which you can improve upon by using the schema option to provide more details about what sort of data the server expects.

A minimalist, schema-less command. More on how this fits into your Hypermedia later.
```js
{
  "href" : "/user/quackers",
  "method" : "PUT",
  "encoding" : "x-form-www-url-encoding"
  "properties" : {
    "FirstName" : "Donald",
    "LastName" : "Duck",
    "Email" : "ermergersh@yoinks.me",
    "nonce" : 5778394
  }
}
```
Because there's no schema we do most of the work in the HTML. The `cmds:update` is a rel to this command. More on this later!

Note that we don't need to use moustache templates to bring in values. As long as an input has a `name` attribute then it can be correctly bound to the correct property.

```html
<form hb-for-command="cmds:update">
<label>First Name</label>
<input name="FirstName">
<br>
<label>Last Name</label>
<input name="LastName">
<br>
<label>Email</label>
<input name="Email" type="email" placeholder="example@example.com">
<br>
<input type="submit" value="Update!">
</form>
```
After creating an instance of Hyperbone View (With this extension) you get..
```html
<form method="PUT" action="/user/quackers" encoding="x-form-www-url-encoding">
<label>First Name</label>
<input name="FirstName">
<br>
<label>Last Name</label>
<input name="LastName">
<br>
<label>Email</label>
<input name="Email" type="email" placeholder="example@example.com" value="ermergersh@yoinks.me">
<br>
<input type="submit" value="Update!">
</form>
```
We don't have a schema so not much has really changed... but in the background Hyperbone has:

- performed two-way binding of the form inputs to the command's properties
- added any missing attributes
- made sure that each input's value has been set `$('input[name="FirstName"]').val() === "Donald"`
- starts listening for submit events so it can bubble a Backbone event up to the parent model.


If you actually don't care how what the form looks like then you can simply do:
```html
<form hb-command-auto="cmds:update"></form>
```
And the entire form will be automatically generated for you. Without a schema everything will be a text input, but by adding a schema you can make the forms a little more useful, add HTML5 validation etc. For example a schema could allow the "Email" field to be an HTML5 'email' type instead of a text input.

### Adding commands to Hypermedia.

Hyperbone reserves another keyword (along with `_links` and '_embedded') which is `_commands`. Commands are nested objects within `_commands`.

Basic `_commands` have the bare minimum required for a machine to be able to make a valid HTTP request. 

Here is our minimalist `_command` as it would appear in an actual Hypermedia JSON document.

```json
{
  "_links" : {
    "self" : {
      "href" : "/user/quackers"
    }
    "cmds:update" : {
      "href" : "#_commands/edit/edit-quackers",
      command : true,
    }
  },
  "FirstName" : "Donald",
  "LastName" : "Duck",
  "Email" : "ermergersh@yoinks.me",
  "_commands" : {
    "edit" : {
      "edit-quackers" : {
        "href" : "/user/quackers",
        "method" : "PUT",
        "encoding" : "x-form-www-url-encoding"
        "properties" : {
          "FirstName" : "Donald",
          "LastName" : "Duck",
          "Email" : "ermergersh@yoinks.me",
          "nonce" : 5778394
        }
      }
    }
  }
}
```
Some things to observe:

- There's a rel in `_links` called `cmds:update` that has the internal path to the command.
- The command is __entirely self contained__. It does not depend on the parent hypermedia resource at all.
- The command's uri could be absolutely anything.
- The command has a property unique to it that doesn't belong to the parent resource called `nonce`.
- When the internal model (the properties) of the command is changed, this doesn't change the parent hypermedia at all.
- A machine can use this to put together an HTTP request to the server.

### Adding metadata to commands 

Commands can be extended with a schema to reveal more information to both the machine and a developer about what the server expects. This includes type and validation. This metadata has the helpful side effect of making it trivial to generate slightly more useful HTML forms for the user.

The same command but with a schema added.
```json
{
  "_links" : {
    "self" : {
      "href" : "/user/quackers"
    }
    "update" : {
      "href" : "#_commands/edit/edit-quackers",
      command : true,
    }
  },
  "FirstName" : "Donald",
  "LastName" : "Duck",
  "Email" : "ermergersh@yoinks.me",
  "_commands" : {
    "edit" : {
      "edit-quackers" : {
        "href" : "/user/quackers",
        "method" : "PUT",
        "properties" : {
          "FirstName" : "Donald",
          "LastName" : "Duck",
          "Email" : "ermergersh@yoinks.me",
          "nonce" : 5778394
        },
        "schema" : {
          "FirstName" : {
            "type" : "Text",
            "description" : "First name",
            "validators" : [
              "required", "/\w/"
            ]
          },
          "LastName" : {
            "type" : "Text",
            "description" : "Last name",
            "validators" : [
              "required", "/\w/"
            ]
          }, 
          "Email" : {
            "type" : "Email",
            "description" : "Email address",
            "validators" : [
              "required", "email"
            ]
          },
          "nonce" : {
            "type" : "Hidden"
          }
        }        
      }
    }
  }
}
```

Some things to observe:

- The schema may or may not contain a schema for each property. The default is 'text' without validation. 
- Each can contain a type (to be confirmed later), a description and an array of validators.
- Order of fields is not preserved here.
- The emphasis is on making this schema trivial to generate on the server and simple to parse on the client.

#### Forcing an order

If the order of fields is important to your server, or you want to define this on the server instead of in the client (why??!!) you can add another attribute to the Command, `enum`, which holds an array.

```json
  "enum" : ["FirstName", "LastName", "Email"]
```

### Bind to a specific input

You may wish to bind an input to some single property in a command externally to a form.

```html
<input type="search" hb-bind-command="cmds:update FirstName">
```

That's really all there is to it.

## Installation

Install with [component(1)](http://component.io):

```sh
    $ component install green-mesa/hyperbone-view
```

## Usage

```js
  var viewEngine = require('hyperbone-view');

  viewEngine.use( require('hyperbone-view-commands') );

  new viewEngine.HyperboneView({
    model : myModel,
    el : myEl
  });
```

## API

This module exposes no public methods

## HyperboneView Attributes

### hb-with-command="command-rel"

Indicates you wish to bind a form and the inputs within the form to a command. The attribute value should be the rel of your command `cmds:update` or the explicit path `edit/edit-quackers'.

Note, this does not change the scope inside the view for the purposes of attribute/innertext templates which will continue to be for the main model scope.

### hb-command-auto="command-rel"

Indicates you with to bind a form to a command, and you're happy for the system to generate that form for you. Pretty handy for development when you just want to add a feature and you don't really care, at this point, what it looks like. 

### hb-bind-command="command-rel property"

Bind any input to any property of any command. Useful for pulling out a particular input to some other part of your view.

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
