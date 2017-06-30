// ==UserScript==
// @name         youtube_towatch_autoremover
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Removes videos automatically from watch later when watched
// @author       kosshi
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

// NOTE: This script may not work for some people, google likes to enable
// styles and features only for some people, sometimes breaking this.
// Feel free to fork a version that works for you.

(function(){
	'use strict';

	console.log('Towatch autoremover has been loaded.');

	if ( document.readyState == 'complete') {
		pageUpdate();
	} else {
		console.log('Waiting for page to load...');
		window.addEventListener('load', pageUpdate);
	}
	window.addEventListener('spfdone', pageUpdate);

	function pageUpdate(){
		setTimeout( ()=>{ // Just doesn't work well without the timeout. I don't know why.
			let elem = document.querySelector('.currently-playing > a > button');
			if ( window.location.href.search('list=WL') > 0 && elem){
				console.log('Removing...');
				elem.click();
				setTimeout(check, 5000);
			}
		}, 2000);
	}


	function check(){
		if(document.querySelector('.currently-playing')) {
			console.log('Failed, retrying..');
			pageUpdate();
		} else {
			console.log('Video has been removed from the playlist.');
		}
	}

})();
