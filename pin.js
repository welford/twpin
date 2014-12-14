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
var POSITION_TIDDLER_TITLE = "$:/config/twpin/position";

exports.startup = function() {
	$tw.hooks.addHook("th-opening-default-tiddlers-list",function(list) {
		//default to before DEFAULT_TIDDLERS_TITLE 
		var position_before = true;
		if($tw.wiki.getTiddlerText(POSITION_TIDDLER_TITLE,"before") !== "before") {
			position_before = false;
		}
		// Add pinned tiddlers to the end of the list if they aren't already in it
		var taggedList = $tw.wiki.getTiddler(DEFAULT_TIDDLERS_TITLE).fields["list"];
		if(taggedList){
			var new_list = [];
			for (var i = 0; i < taggedList.length; i++) {
				if(list.indexOf(taggedList[i]) === -1 && new_list.indexOf(taggedList[i]) === -1) {
					new_list.push(taggedList[i]);
				}
			}
			if(new_list.length == 0)
				return list;

			if(position_before){
				list = new_list.concat(list);
			}else{
				list = list.concat(new_list);
			}
		}
		return list;
	});
};

})();