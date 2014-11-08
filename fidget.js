/*\
title: $:/plugins/welford/twpin/fidget.js
type: application/javascript
module-type: widget

Widget which picks up messages to append values to list fields

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var Fidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "tm-append-to-list", handler: "handleAppendToList"},	
		{type: "tm-remove-from-list", handler: "handleRemoveFromList"},	
	]);
};

/*
Inherit from the base widget class
*/
Fidget.prototype = new Widget();
/*
Render this widget into the DOM
*/
Fidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};
/*
Compute the internal state of the widget
*/
Fidget.prototype.execute = function() {
	// Get our parameters
	this.field = this.getAttribute("field");
	this.value = this.getAttribute("value");
	// Construct the child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
Fidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.field || changedAttributes.value) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

Fidget.prototype.GetParameters = function(event) {	
	if(typeof event.param === "object") {
		// If we got a hashmap use it as the template
		var templateTiddler = event.param;
		this.field = templateTiddler.field		
		this.value = templateTiddler.value
	}
}

Fidget.prototype.handleAppendToList = function(event) {	
	this.GetParameters(event);
	//get field, add value to front and set it
	var tr = $tw.utils.parseTextReference(this.field),
		title = tr.title || currTiddlerTitle;
	var tiddler = this.wiki.getTiddler(title);
	if(tiddler) {
		var original = tiddler.fields["list"];
		var updatedField;
		if(original){
			if(original.indexOf(this.value) == -1){
				updatedField = original.slice(0);
				updatedField.unshift(this.value);
			}
		}
		else{
			updatedField = [this.value];
		}
		this.wiki.setTextReference(this.field,updatedField,this.getVariable("currentTiddler"));							
	}
	return false;
};

Fidget.prototype.handleRemoveFromList = function(event) {
	this.GetParameters(event);
	if(this.field && this.value){
		//get field, add value to front and set it
		var tr = $tw.utils.parseTextReference(this.field),
			title = tr.title || currTiddlerTitle;
		var tiddler = this.wiki.getTiddler(title);
		if(tiddler){		
			var original = tiddler.fields["list"];
			var updatedField;
			if(original){
				var index = original.indexOf(this.value);
				updatedField = original.slice(0);
				if(index > -1){
					updatedField.splice(index, 1);
					this.wiki.setTextReference(this.field,updatedField,this.getVariable("currentTiddler"));
				}
			}
		}
	}
	return false;
};

exports.fidget = Fidget;

})();
