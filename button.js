/*\
title: $:/core/modules/widgets/button.js
type: application/javascript
module-type: widget

Button widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var ButtonWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ButtonWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ButtonWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	// Remember parent
	this.parentDomNode = parent;
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	// Create element
	var domNode = this.document.createElement("button");
	// Assign classes
	var classes = this["class"].split(" ") || [];
	if(this.selectedClass) {
		if(this.set && (this.setTo || this.appendFront || this.remove) && this.isSelected()) {
			$tw.utils.pushTop(classes,this.selectedClass.split(" "));
		}		
		if(this.popup && this.isPoppedUp()) {
			$tw.utils.pushTop(classes,this.selectedClass.split(" "));
		}
	}
	domNode.className = classes.join(" ");
	// Assign other attributes
	if(this.style) {
		domNode.setAttribute("style",this.style);
	}
	if(this.tooltip) {
		domNode.setAttribute("title",this.tooltip);
	}
	if(this["aria-label"]) {
		domNode.setAttribute("aria-label",this["aria-label"]);
	}
	// Add a click event handler
	domNode.addEventListener("click",function (event) {
		var handled = false;
		if(self.invokeActions(event)) {
			handled = true;
		}
		if(self.to) {
			self.navigateTo(event);
			handled = true;
		}
		if(self.message) {
			self.dispatchMessage(event);
			handled = true;
		}
		if(self.popup) {
			self.triggerPopup(event);
			handled = true;
		}
		if(self.set) {
			self.setTiddler();
			handled = true;
		}		
		if(handled) {
			event.preventDefault();
			event.stopPropagation();
		}
		return handled;
	},false);
	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
};

ButtonWidget.prototype.getBoundingClientRect = function() {
	return this.domNodes[0].getBoundingClientRect();
}

ButtonWidget.prototype.isSelected = function() {
	var tiddler = this.wiki.getTiddler(this.set);
	var setTo = this.setTo || this.appendFront || this.remove;
	return tiddler ? tiddler.fields.text === setTo : this.defaultSetValue === setTo;
};

ButtonWidget.prototype.isPoppedUp = function() {
	var tiddler = this.wiki.getTiddler(this.popup);
	var result = tiddler && tiddler.fields.text ? $tw.popup.readPopupState(this.popup,tiddler.fields.text) : false;
	return result;
};

ButtonWidget.prototype.navigateTo = function(event) {
	var bounds = this.getBoundingClientRect();
	this.dispatchEvent({
		type: "tm-navigate",
		navigateTo: this.to,
		navigateFromTitle: this.getVariable("storyTiddler"),
		navigateFromNode: this,
		navigateFromClientRect: { top: bounds.top, left: bounds.left, width: bounds.width, right: bounds.right, bottom: bounds.bottom, height: bounds.height
		},
		navigateSuppressNavigation: event.metaKey || event.ctrlKey || (event.button === 1)
	});
};

ButtonWidget.prototype.dispatchMessage = function(event) {
	this.dispatchEvent({type: this.message, param: this.param, tiddlerTitle: this.getVariable("currentTiddler")});
};

ButtonWidget.prototype.triggerPopup = function(event) {
	$tw.popup.triggerPopup({
		domNode: this.domNodes[0],
		title: this.popup,
		wiki: this.wiki
	});
};

ButtonWidget.prototype.setTiddler = function() {
	if(this.setTo)
		this.wiki.setTextReference(this.set,this.setTo,this.getVariable("currentTiddler"));
	if(this.appendFront){
		//get field, add value to front and set it
		var tr = $tw.utils.parseTextReference(this.set),
			title = tr.title || currTiddlerTitle;
		var tiddler = this.wiki.getTiddler(title);	
		if(tiddler) {			
			var name = this.param.toLowerCase().trim();
			var original = tiddler.fields[name];
			var updatedField;
			if(original){	
				if(original.indexOf(this.appendFront) == -1){
					updatedField = original.slice(0);
					updatedField.unshift(this.appendFront);
				}
			}
			else{
				updatedField = [this.appendFront];
			}
			this.wiki.setTextReference(this.set,updatedField,this.getVariable("currentTiddler"));							
		}
	}
	if(this.remove){
		//get field, add value to front and set it
		var tr = $tw.utils.parseTextReference(this.set),
			title = tr.title || currTiddlerTitle;
		var tiddler = this.wiki.getTiddler(title);	
		if(tiddler){			
			var name = this.param.toLowerCase().trim();
			var original = tiddler.fields[name];
			var updatedField;
			if(original){	
				var index = original.indexOf(this.remove);
				updatedField = original.slice(0);
				if(index > -1){					
					updatedField.splice(index, 1);
					this.wiki.setTextReference(this.set,updatedField,this.getVariable("currentTiddler"));
				}				
			}			
		}
	}
};

/*
Compute the internal state of the widget
*/
ButtonWidget.prototype.execute = function() {
	// Get attributes
	this.to = this.getAttribute("to");
	this.message = this.getAttribute("message");
	this.param = this.getAttribute("param");
	this.set = this.getAttribute("set");
	this.setTo = this.getAttribute("setTo");
	this.appendFront = this.getAttribute("appendFront");
	this.remove = this.getAttribute("remove");
	this.popup = this.getAttribute("popup");
	this.hover = this.getAttribute("hover");
	this["class"] = this.getAttribute("class","");
	this["aria-label"] = this.getAttribute("aria-label");
	this.tooltip = this.getAttribute("tooltip");
	this.style = this.getAttribute("style");
	this.selectedClass = this.getAttribute("selectedClass");
	this.defaultSetValue = this.getAttribute("default");
	// Make child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
ButtonWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.to || changedAttributes.message || changedAttributes.param || changedAttributes.set || changedAttributes.setTo || changedAttributes.appendFront || changedAttributes.remove || changedAttributes.popup || changedAttributes.hover || changedAttributes["class"] || changedAttributes.selectedClass || changedAttributes.style || (this.set && changedTiddlers[this.set]) || (this.popup && changedTiddlers[this.popup])) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports.button = ButtonWidget;

})();
