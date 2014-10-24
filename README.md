jsonymer
======

##JSON Editor for Polymer Web Components
--------




##Features
  - Ability to take in any Javascript Object and make each item editable (as a string)
  - Add/Remove Items
  - Tab through every single key/value, as well as through the *add item* buttons for quick editing
  - Simply API to retrieve the edited object in the same format as shown on screen
  - Of course, built as a polymer web component for ease of use and integration


##Basic Use
--------

Include the web component file in your webpage *head* (or at the top of another component)
```
<link rel="import" href="jsonymer-editor.html">
```

Then, place your `jsonymer-editor` element where you'd like it to be
```
<jsonymer-editor id="myJsonEditor"></jsonymer-editor>
```

Finally, but optionally, give your editor some initial object for editing. If you don't do this, you'll simply start with an empty object. There are two ways to init an object with jsonymer:

#####On the element tag itself using the obj attribute (kinda ugly though)
```
// (repeat: kinda ugly though)
<jsonymer-editor obj="{firstname:'Joe'}"></jsonymer-editor>
```
#####Or, through the Javascript element (by changing the obj property)
```
var jsonymerEditor = document.getElementById('myJsonymer');

jsonymerEditor.obj = {
  firstname : 'Joe',
  type : 'Banana'
};
```
Keep in mind, any time you change the *obj* property the editor will update automatically!


##Methods
-----

###.toJSON( )
Returns the object in its final format, as shown on screen.
