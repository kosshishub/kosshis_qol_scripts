(function(){
	'use strict';
	let img = document.querySelector('.media-image');
	console.log('EXECUTING TWITTER MEDIA SCRIPT', img);
	if(img && img.src){
	chrome.runtime.sendMessage({
    	action: "twitterMedia",
    	source: img.src
	});
	}


})();