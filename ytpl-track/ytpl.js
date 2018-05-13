'use strict';

const { exec, execSync, spawn } = require('child_process');
const https = require('https');
const fs = require('fs');

const thread_count = 5;

const gapi_key = "AIzaSyChv3OvIJPrE-I5hUpzw2bwcyT3JhkaN5w"; // pls no abuse


function build(url, options){
	let reg = url+"?";
	for (let i = 0; i < options.length; i++) {
		if(i!=0) reg += "&";
		reg += options[i];
	}
	return reg;
}


function print(data){
	process.stdout.write(data);
}

function getPlaylist(id, callback){

	print('Downloading playlist metadata... 0%');

	let id_array = [];

	// make the initial get to get the recursive loop started

	let fetched = 0;

	let url = build( "https://www.googleapis.com/youtube/v3/playlistItems",
		[
		//"pageToken=CAUQAA",
		"playlistId="+id,
		"key="+gapi_key,
		"part=snippet,contentDetails,status",
		"maxResults=50"
	]);

	makerequest('GET', url, (err, b)=>{
		if(err) {
			callback(err);
			return;
		}
		fetcher(b)
	});

	// loop
	function fetcher(buffer){
		let res = JSON.parse(buffer.toString());

		for (var i = 0; i < res.items.length; i++) {

			fetched++;
			//console.log(res.items[i]);
			id_array.push( {
				title: res.items[i].snippet.title,
				id: res.items[i].contentDetails.videoId
			} );

		}

		print('\rDownloading playlist metadata... '
			+(fetched/res.pageInfo.totalResults*100|0)+"%");

		// Run recursively until no nextPageToken is available
		if( res.nextPageToken ) {

			let url = build( 
				"https://www.googleapis.com/youtube/v3/playlistItems",
				[
				"pageToken="+res.nextPageToken,
				"playlistId="+id,
				"key="+gapi_key,
				"part=snippet,contentDetails",
				"maxResults=50"
			]);

			makerequest('GET', url, (err, b)=>{
				if(err) {
					callback(err);
					return;
				}
				fetcher(b)
			});

		} else {
			print(`\nFetched ${fetched} items\n`);
			callback(null, id_array);
		}

	}

}

function download(id, callback, statusCallback){
	// Find the id of the format we want. This may not be necessary to do
	// for every single item, but it may make error handling a little easier.
	// If this fails the most probable cause it that video is deleted.

 	statusCallback( "META" );

	exec(`youtube-dl -F ${id}`, (error, stdout, stderr)=>{
		let list = stdout.split('\n');
		for (var i = 0; i < list.length; i++) {
			
			if( list[i].search("m4a")>0
			 && list[i].search("128k")>0) {
			
				ytdl_spawn(id, list[i].split(' ')[0], callback, statusCallback);
				return;
			}
		}

		callback("Unknown issue");

		// let text = "# ERROR\n\n";
		// text+=error;
		// text+="\n\n# STDOUT\n\n"
		// text+=stdout;
		// text+="\n\n# STDERR\n\n"
		// text+=stderr;
		// fs.writeFileSync(`err-${id}.log`, text);
	});
}

function ytdl_spawn(id, format, callback, statusCallback){

	statusCallback( "INIT" );
	
	let child = spawn( `youtube-dl`, 
		[`-f ${format}`, 
		'-odl/%(title)s [%(id)s].%(ext)s',
		`${id}`,
	]);

	child.stdout.on('data', (chunk) => {
		
		const progress = 	/\[download\] (.+?)%/.exec(chunk.toString());
		if(progress && progress[1]) statusCallback( parseInt(progress[1])+"%" );
		
	});

	child.on('close', (code) => {
		//console.log(`child process exited with code ${code}`);
		if( code == 0 ) callback();
		else callback(`Exited with error code ${0}`);
	});

	child.stderr.on('data', (chunk) => {
		console.log(chunk.toString());
	});


}

function makerequest(method, url, callback){

	const path = 	 	/:\/\/.+?(\/.*)/	.exec(url)[1];
	const hostname = 	/:\/\/(.+?)\//		.exec(url)[1];

	const options = {
		hostname: hostname,
		port: 443,
		path: path,
		method: method,
		headers: {
			//"referer":referer
		}
	};

	const req = https.request(options, (res) => {
		//console.log(`${res.statusCode}`);
		if(res.statusCode != 200) {
			//console.log("\nMake sure your playlist id is correct and public/visible!");
			//throw "Server responded with "+ res.statusCode;
			callback("Server responded with "+ res.statusCode);
			return;
		}
		var chunks = [];
		res.on('data', (d) => chunks.push(d));
		res.on('end', ()=> {
			let body = Buffer.concat(chunks);
			callback(null, body);
		});
	});
	req.on('error', (e) => {
		throw (e);
	});
	req.end();
}



let logData = {};
let progressString = '';
function tlog_totalProgress(current, max){
	progressString = `${current}/${max}`
}
function tlog(id, status){
	let k = 't'+id;
	if(!logData[k]) logData[k] = {
		state: "init"
	}

	logData[k].state = status.padEnd(20);

	let txt = progressString;
	for (let key in logData ) {
		txt+= " " + key + " " +logData[key].state;
	}
	print("\r"+txt);

}

function main(plid){

	if(!plid) { 
		console.error("No playlist ID provided!");
		console.log("Example usage: node ytpl PLIz63zYvXCTbdE8BILXRwYHQJDbGj0CIK");
		return 1;
	}

	try {
		let ytdl_version = execSync( 'youtube-dl --version' );
		console.log("youtube-dl version:"+ ytdl_version);

		// AtomicParsley is used by youtube to write the thumbnails
		let ap_version = execSync( 'AtomicParsley -v' );
		console.log("AtomicParsley version"+ap_version );
	} catch(e) {
		console.error(e);
		console.log("MISSING PROGRAMS!");
		console.log("Make sure youtube-dl and AtomicParsley are installed!");
		return 1;
	}


	return getPlaylist(plid, (err, list)=>{

		if(err) {
			console.log(' ');
			console.error(err);
			console.log('Make sure you provided a valid playlist ID. ');
			console.log("Example usage: node ytpl PLIz63zYvXCTbdE8BILXRwYHQJDbGj0CIK");
			return 1;
		}
		

		console.log('Checking for .track file...');
		let tfn = "track/"+plid+".track";

		let tfnExists = fs.existsSync( tfn );

		let trackData = '';

		if(!fs.existsSync( 'track' )) fs.mkdirSync("track");

		if(tfnExists) {
			trackData = fs.readFileSync(tfn).toString();
			console.log('Trackfile loaded');
		} else {
			fs.writeFileSync(tfn, trackData);
			console.log('Trackfile created');
		}

		let work_index = 0;

		var thread = (tid)=>{
			if(work_index>=list.length) {
				//console.log(tid+" Nothing left to do.");
				tlog(tid, "FINISHED");
				return;
			}

			//console.log(tid+"Working on item id", work_index);
			let item = list[work_index];

			work_index++;

			tlog_totalProgress(work_index, list.length);

			if( trackData.search(item.id)!=-1 ){

				//console.log(tid+" "+item.id, "Exists!");
				tlog(tid, "EXISTING");
				thread(tid);

			} else {

				download(item.id, (error)=>{
					if(error) {

						//console.log(tid+" "+item.id, error);
						//console.log(tid+" "+item.id, 'ERRORED');
						thread(tid);

					} else {

						trackData+= item.id+"\n";
						fs.writeFileSync(tfn, trackData);

						//console.log(tid+" "+item.id, 'Finished');
						thread(tid);

					}
				},(s)=>{
					//print("\r"+s);
					tlog(tid, (item.id +" "+ s));
				});
			}
		}

		for (var i = 0; i < thread_count; i++) {
			thread(i);
		}
	});
}


if( main(process.argv[2]) ) return 1;

// If no error, let the program exit "naturally"