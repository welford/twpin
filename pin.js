/*\
title: $:/plugins/welford/twpin/pin.js
type: application/javascript
module-type: startup

Appends hooks so that i can change the default tiddlers

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "addpinnedtiddlers";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.before = ["story"];
exports.synchronous = true;

// Default tiddlers
var DEFAULT_TIDDLERS_TITLE = "$:/DefaultTiddlers";

exports.startup = function() {
	$tw.hooks.addHook("th-opening-default-tiddlers-list",function(list) {
		// Add pinned tiddlers to the end of the list if they aren't already in it
		var taggedList = $tw.wiki.getTiddler(DEFAULT_TIDDLERS_TITLE).fields["list"];
		if(taggedList){
			for (var i = 0; i < taggedList.length; i++) {
				if(list.indexOf(taggedList[i]) === -1) {
					list.push(taggedList[i]);
				}
			}
		}
		return list;
	});
};

})();