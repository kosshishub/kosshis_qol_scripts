'use strict';

const VERSION = "2.0";

const session_json_header = "/*BROWSER_SESSION_JSON_KOSSHI_FI*/";
const session_json_help = 
`
/*
* Do not remove the comment above! Removing it will cause the extension to treat
* this file as just urls seprated with newlines!
*/

`;
/* globals chrome, CommentStripper*/

const commentStripper = new CommentStripper();

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
function currentTab(callback){
	chrome.windows.getCurrent((w)=>{ 
		chrome.tabs.query({windowId:w.id, active:true}, (a)=>{
			callback(a);
		});
	});
}
function httpget(url, callback){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			callback(this.responseText);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function fixurl(url){
	let domain = /:\/\/(.*?)\//.exec(url)[1];
	if(domain == "klbibkeccnjlkjkiokjodocebajanakg") 
		url = /uri=(.*)/.exec(url)[1];
	return url;
}

function downloadText(text){
	var blob = new Blob([text], {type: "text/plain"});
	var url = URL.createObjectURL(blob);
	chrome.downloads.download({
	  url: url // The object URL can be used as download URL
	  
	});

}
 
function selectTab(id){
	chrome.tabs.update(id, {selected:true});

	chrome.tabs.get(id, (tab)=>{
		chrome.windows.update(tab.windowId, {focused:true})
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

function createTabButton(tab){

	let result = document.createElement('div');
	result.className='searchResult';

	let selectButton = document.createElement('button');
	selectButton.className = "open";
	selectButton.innerHTML = "<b>"+tab.title+"</b><br><i>" + tab.url + "</i>";
	selectButton.onclick = ()=>{ console.log('select', tab.id); selectTab( tab.id ); };


	let closeButton = document.createElement('button');
	closeButton.className = "close";
	closeButton.innerHTML = "X";
	closeButton.onclick = ()=>{ 
		
		chrome.tabs.remove(tab.id, ()=>{
			print('Success!'); 
			result.parentNode.removeChild(result);

		});
	};


	result.appendChild(closeButton);
	result.appendChild(selectButton);

	return result;

}

function main(){
	let txt = document.querySelector('#text');
	txt.innerHTML = 
	`

	<h2>Tab search</h2>
	<input type="text" id="tabSearch" placeholder="Search tabs"><br>
	<div id="tabSearchResults"></div>
	
	<div id="misc">
		<h2>Misc</h2>
		<button id="logDupes">Show duplicate tabs</button>
		<button id="closeDupesFromAll">    Close duplicate tabs from everywhere</button><br>
		<button id="closeDupesFromCurrent">Close duplicate tabs from current window</button><br>
		<button id="listDomain">List by domain</button>
	</div>

	<h2>Session managment</h2>
	<button id="sessionSaveCurrent">Download session file (Window)</button><br>
	<button id="sessionSaveGlobal" >Download session file (Global)</button>
	<br>Import session file: <input id="file" type="file"/>
	<br>
	<br>Log:
	<div id="log"></div>
	`;


	document.querySelector('#tabSearch').oninput = ()=>{
		let elem = document.querySelector('#tabSearch');
		let resultElem = document.querySelector('#tabSearchResults');

		let term = elem.value.toUpperCase();
		resultElem.innerHTML = '';

		if(!term) {
			return;
		}

		allTabs( (tabs)=>{
			for (var i = 0; i < tabs.length; i++) {
				let tab = tabs[i];
				if( tabs[i].title.toUpperCase().search(term) > -1 || 
					tabs[i].url.toUpperCase().search(term) > -1
				) {
					resultElem.appendChild(createTabButton(tab));
				}
			}
		} );
	};

	document.querySelector('#listDomain').onclick     = ()=>{
		let domains = {};
		let total = 0;
		allTabs((tabs)=>{

			for (var i = 0; i < tabs.length; i++) {
				let key = /:\/\/(.*?)\//.exec(tabs[i].url)[1];
				if(key == "klbibkeccnjlkjkiokjodocebajanakg") 
					key = /uri=.*:\/\/(.*?)\//.exec(tabs[i].url)[1];
				domains[key]=++domains[key]||1;
				total++;
				console.log(key);
			}
			for(let key in domains)
				print(`${domains[key]} (${Math.round(domains[key]/total*100)}%): ${key}`);
			
		});
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

	document.querySelector('#closeDupesFromAll').onclick = ()=>{
		allTabs((tabs)=>{
			getDupeTabs(tabs, (deletionIDList, uniqueCount)=>{
				console.log(deletionIDList);
				print(`Closing ${deletionIDList.length} tabs...`);
				chrome.tabs.remove(deletionIDList, ()=>print('Success!'));
			});
		});
	};

	document.querySelector('#sessionSaveCurrent').onclick     = ()=>{
		currentWindowTabs((tabs)=>{
			let json = [[]];
			for (var i = 0; i < tabs.length; i++) {
				json[0].push(fixurl(tabs[i].url));
			}
			downloadText(
				session_json_header +
				session_json_help +
				JSON.stringify(json, null, "\t")
			);

		});
	};

	document.querySelector('#sessionSaveGlobal').onclick     = ()=>{
		allTabs((tabs)=>{

			let windows = {};

			for (var i = 0; i < tabs.length; i++) {
				let winkey = "win"+tabs[i].windowId;
				if(windows[winkey] === undefined) windows[winkey] = [];
				windows[winkey].push(fixurl(tabs[i].url));
			}

			let json = [];
			for (let key in windows) {
				json.push(windows[key]);
			}
			downloadText(
				session_json_header +
				session_json_help +
				JSON.stringify(json, null, "\t")
			);

		});
	};

	document.querySelector('#logDupes').onclick = ()=>{
		
		console.log("0");

		allTabs((tabs)=>{
			console.log("1");
			getDupeTabs(tabs, (deletionIDList, uniqueCount, delURL, duplicateTabIDs)=>{

				console.log("2");
				duplicateTabIDs.forEach((id)=>{

					console.log("3");
					chrome.tabs.get(id, (tab)=>{
						document.querySelector("#tabSearchResults").appendChild(createTabButton(tab));
					});
				});
			});
		});
	};

	document.querySelector('input#file').addEventListener('change', ()=>{
		let file = document.querySelector('input#file').files;
		let fn = new FileReader();

		fn.onload = function(event) {
			let text = event.target.result;
			let list = text.split('\n');
			if(list[0] == session_json_header) {
				let session = JSON.parse(commentStripper.strip(text));

				console.log(session);

				for (var i = 0; i < session.length; i++) 
					chrome.windows.create( { url:session[i] } );
				
			} else {

				let cfg = {url:[]};

				for (var i = 0; i < list.length; i++) 
					if(list[i].match(/http/)) cfg.url.push( list[i] );

				chrome.windows.create(cfg);
			}
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

	chrome.tabs.query({audible:true}, (t)=>{
		for (var i = 0; i < t.length; i++) {
			document.querySelector("#tabSearchResults").appendChild(createTabButton(t[i]));
		}
	});

	currentWindowTabs((tabs)=>{
		getDupeTabs( tabs, (deletionIDList, uniqueCount)=>{
			print(`In current window:<br> ${tabs.length} tabs, ${deletionIDList.length} duplicates`);
		});
	});
	allTabs((tabs)=>{
		getDupeTabs( tabs, (deletionIDList, uniqueCount)=>{
			chrome.windows.getAll(w=>{
				print(`In all windows (${w.length} in total):<br> ${tabs.length} tabs, ${deletionIDList.length} duplicates`);
			});
		});
	});

	if(window.modules)
	for (var i = 0; i < window.modules.length; i++) {
		window.modules[i]();
	}

}

document.addEventListener('DOMContentLoaded', main);