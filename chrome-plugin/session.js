'use strict';

if(!window.modules) window.modules = [];

async function getPocket( write_enable ){
	return new Promise( (resolve, reject) => {

		chrome.storage.local.get( [ 'pocket' ], result =>{
			if( !result.pocket  ) result.pocket = [];
			resolve( result.pocket  );
		});
	});
}

async function setPocket( pocket ){

	return new Promise( (resolve, reject) => {
		chrome.storage.local.set( { pocket:pocket  } , result =>{		
			resolve();
		});
	});
}

// WARN: DO NOT WRITE WITH OLD DATA! OTHER "THREADS" COULD HAVE DIRTIED YOUR DATA !!!!

function createWindowButton( p, i ){

	let result = document.createElement('div');
	result.className='searchResult';

	let selectButton = document.createElement('button');
	selectButton.className = "open";
	//selectButton.innerHTML = "<b>"+p.title+"</b><br><i>" + "Desc" + "</i>";
	
	let html = '';
	for( let i = 0; i < p.tabs.length; i++ ) {
		let favicon = p.tabs[i].favIconUrl;
		if( favicon  ) html+= `<img src=${favicon} height=16px>`;
	}
	selectButton.innerHTML = html;

	selectButton.onclick = ()=>{ 
	//	console.log('select', tab.id); selectTab( tab.id );
		let urls = [];
		for( let i=0; i<p.tabs.length;i++  ) urls.push(p.tabs[i].url);
		chrome.windows.create( { url:urls } );
	};


	let closeButton = document.createElement('button');
	closeButton.className = "close";
	closeButton.innerHTML = "X";
	closeButton.onclick = async ()=>{ 
		let pocket = await getPocket();
		pocket.splice( i, 1 );
		await setPocket( pocket );
		updatePocket();
	};

	result.appendChild(closeButton);
	result.appendChild(selectButton);

	return result;
}

async function updatePocket(){
	
	let pocketElement = document.querySelector('#pocket' );
	pocketElement.innerHTML='';

	let pocket = await getPocket();
	for( let i = 0; i < pocket.length; i++  ) {	
		pocketElement.appendChild( createWindowButton(pocket[i], i));
	}

}

window.modules.push(
	function(){

		console.log('SessionV2.1 loaded');

		let pocketButton = document.querySelector('#pocketWindow');
		pocketButton.onclick = ()=> {

			currentWindowTabs( async (tabs)=>{
				
				let pocket = await getPocket();
				pocket.push( {
					title:"Window, "+ tabs.length + ' tabs',
					tabs:tabs	
				});	
				await setPocket( pocket );
				updatePocket();
       
			});
		};

// IMPORT/EXPORT
		
		const pocket_json_header = "KOSSHI_NET_PLUGIN_POCKET_BACKUP\n";
	

		let importPocket = document.querySelector('input#importPocket');
		console.log( importPocket  );
		importPocket.addEventListener('change', ()=>{
			let file = importPocket.files;
			let fn = new FileReader();

			fn.onload = async function(event) {
				console.log( 'event'  );
				let text = event.target.result;
				if(text.search(pocket_json_header) === 0) {
					let pocket = await getPocket();
					let t = text.replace(pocket_json_header, '');
					let importPocket = JSON.parse(t);
					console.log(importPocket);

					Array.prototype.push.apply( pocket, importPocket  );
					console.log(pocket);
					await setPocket( pocket  );
					updatePocket();
				}else{
					throw "No header!";

				} 
			};

			fn.readAsText(file[0]);
		});

		document.querySelector('#exportPocket').onclick     = async ()=>{
			let pocket = await getPocket();
			downloadText(
				pocket_json_header +
				JSON.stringify(pocket)
			);
		};

		updatePocket();

	}
);



