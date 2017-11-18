'use strict';


function allTabs(callback) {
	chrome.tabs.query({}, function(tabs) {
		callback(tabs);
	});
}

function currentWindowTabs(callback){
	chrome.windows.getCurrent((w)=>{ 
		chrome.tabs.query({windowId:w.id}, (a)=>{
			callback(a);
		});
	});
}

function main(){
	let txt = document.querySelector('#text');
	txt.innerHTML = 
	`
	<button id="closeDupesFromAll">    Close duplicate tabs from everywhere</button><br>
	<button id="closeDupesFromCurrent">Close duplicate tabs from current window</button><br>
	
	<button id="logDupes">Log dupes in current</button>
	<button id="saveTabs">Log all tabs in current</button>
	<br>Open links from a txt file: <input id="file" type="file"/>
	<br>Log:
	<div id="log"></div>
	`;

	document.querySelector('#closeDupesFromAll').onclick     = ()=>{

	};
	document.querySelector('#closeDupesFromCurrent').onclick = ()=>{
		currentWindowTabs((tabs)=>{
			getDupeTabs(tabs, (deletionIDList, uniqueCount)=>{
				console.log(deletionIDList);
				print(`Closing ${deletionIDList.length} tabs...`);
				chrome.tabs.remove(deletionIDList, ()=>print('Success!'));
			});
		});
	};

	document.querySelector('#saveTabs').onclick     = ()=>{
		currentWindowTabs((tabs)=>{
			let file = "";
			for (var i = 0; i < tabs.length; i++) {
				file += tabs[i].url + "<br>";
			}
			print(file);

		});
	};

	document.querySelector('#logDupes').onclick = ()=>{
		// kill me pls
		currentWindowTabs((tabs)=>{
			getDupeTabs(tabs, (deletionIDList, uniqueCount, delURL, duplicateTabIDs)=>{
				duplicateTabIDs.forEach((id)=>{
					chrome.tabs.get(id, (tab)=>{
						print(`<button id="tab${tab.id}select">select</button> <button id="tab${tab.id}close">close</button> ${tab.url}`);
						document.querySelector( `#tab${tab.id}select` ).addEventListener('click',()=>{
							chrome.tabs.update(tab.id, {selected:true});
						});
						document.querySelector( `#tab${tab.id}close` ).addEventListener('click',()=>{
							chrome.tabs.remove([tab.id]);
						});
					});
				});
			});
		});
	};

	document.querySelector('input#file').addEventListener('change', ()=>{
		let file = document.querySelector('input#file').files;
		let fn = new FileReader();

		fn.onload = function(event) {
			let list = event.target.result.split('\n');
			let cfg = {url:[]};

			for (var i = 0; i < list.length; i++) 
				if(list[i].match(/http/)) cfg.url.push( list[i] );

			chrome.windows.create(cfg);
		};

		fn.readAsText(file[0]);
	});

	chrome.runtime.onMessage.addListener( (request, sender)=>{
		if (request.action == "twitterMedia") {
			print('Opened: '+request.source);
			chrome.tabs.create({url:request.source, active:false});
		}
	});
	chrome.tabs.executeScript(null, {
		file: "twittermedia.js"
	});
		



	currentWindowTabs((tabs)=>{
		getDupeTabs( tabs, (deletionIDList, uniqueCount)=>{
			print(`In current window:<br> ${tabs.length} tabs, ${deletionIDList.length} dupes and ${uniqueCount} uniques.`);
		});
	});
	allTabs((tabs)=>{
		getDupeTabs( tabs, (deletionIDList, uniqueCount)=>{
			print(`In all windows:<br> ${tabs.length} tabs, ${deletionIDList.length} dupes and ${uniqueCount} uniques.`);
		});
	});

}

function print(txt){
	let div = document.createElement('div');
	div.className = 'entry';
	div.innerHTML = txt;
	document.querySelector('#log').appendChild(div);
}

function getDupeTabs( tabs, callback ){
	let urla = {};

	for (let i = 0; i < tabs.length; i++) {
		if(!urla[tabs[i].url]) urla[tabs[i].url] = [];
		urla[tabs[i].url].push(tabs[i]);
	}
	let num = 0;
	let deletionIDList = [];
	let duplicateTabIDs = [];

	let delURL = [];

	for (let key in urla) {
		num++;
		console.log(urla[key].length, key);
		if(urla[key].length > 1){
			delURL.push(key);

			for (let i = 0; i < urla[key].length; i++) 
				duplicateTabIDs.push(urla[key][i].id);
		}

		for (let i = 0; i < urla[key].length-1; i++) 
			deletionIDList.push(urla[key][i].id);
		
	}

	callback( deletionIDList, num, delURL, duplicateTabIDs );
}

document.addEventListener('DOMContentLoaded', main);