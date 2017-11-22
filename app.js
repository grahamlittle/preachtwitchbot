// npm install tmi.js --save
// npm install lokijs --save
// npm install node-aplay --save

// Twitch library
var tmi = require('tmi.js');
var loki = require('lokijs');
var fs = require('fs');
//var Sound = require('node-aplay');
var play = require('audio-play');
var load = require('audio-loader');
var files_ = files_ || [];

// Get list of files from the filesystem
console.log("[TWITCHBOT EVENT] List files in application folder");
fs.readdirSync('./testfiles/').forEach(file => {
	if (!fs.statSync('./testfiles/'+file).isDirectory()){
  		console.log("[TWITCHBOT EVENT] File name : " + file);
  		files_.push(file);
    }
})
files_.sort();
console.log("[TWITCHBOT EVENT] AUDIO FILE LIST : " + files_);

// Local storage options for last played file
// Autosave disabled for now
console.log("[TWITCHBOT EVENT] Load / Create localised storage");
var db = new loki('lastfileplayed.json', { 
	persistenceMethod:'fs', 
	autoload: true, 
	autoloadCallback: databaseInitialize
});

// When database is first loaded, check for existing collection
// where it does not exist then create the collection ready to store data.
function databaseInitialize() {
  var lastfileplayed = db.getCollection('lastfileplayed');

  if (lastfileplayed == null) {
	console.log("[TWITCHBOT EVENT] No DB Collection created yet.");
	lastfileplayed = db.addCollection('lastfileplayed');
	
	db.saveDatabase(function(err) {
		if (err) {
		  console.log(err);
		}
		else {
		  console.log("[TWITCHBOT EVENT] DB Collection saved in DB Initialisation");
		}
	});
	
  } else {
	  
	console.log("[TWITCHBOT EVENT] DB Collection already created.");
	
  }
  
  subNotifier();
};

// With the lastFilePlayed find the index of that file and return the next file to play
function getNextFileToPlay(lastFilePlayed) {

	var totalFileCount = files_.length;
	var lastFilePosition = files_.indexOf(lastFilePlayed);
	var nextFilePosition = 0;
		
	if (lastFilePosition != (totalFileCount-1)) {
		nextFilePosition = lastFilePosition + 1;
	}
	
	return files_[nextFilePosition];	
}

function playFile(fileToPlay) {

	var nextFileToPlay = "./testfiles/"+fileToPlay;
	
	console.log("[TWITCHBOT EVENT] Playing next file : " + nextFileToPlay);

	//new Sound(nextFileToPlay).play();
	load(nextFileToPlay).then(play);
}

function updateDbWithFilePlayed(filePlayed) {
	var lastfilecollection = db.getCollection("lastfileplayed");
	var entryCount = lastfilecollection.count();
	var lastfileplayed;
	
	console.log("[TWITCHBOT EVENT] Updating DB with latest file played");
	
	if (entryCount==0) {
		console.log("[TWITCHBOT EVENT] No entry in DB, create first entry.");
		lastfilecollection.insert({name:filePlayed,lastplayed:'correct'});
	} else {
		console.log("[TWITCHBOT EVENT] Update existing entry in DB.");
		//lastfileplayed = lastfilecollection.find({'lastplayed':'correct'});
		lastfileplayed = lastfilecollection.get(1);
		lastfileplayed.name = filePlayed;
		lastfileplayed.lastplayed = "correct";
		lastfilecollection.update(lastfileplayed);
	}
	
	db.saveDatabase(function(err) {
		if (err) {
		  console.log(err);
		}
		else {
		  console.log("[TWITCHBOT EVENT] DB Updated with played file : " + filePlayed);
		}
	});	
	
	console.log("[TWITCHBOT EVENT] DB updated with last file played : name = " + filePlayed);
}

function subNotifier() {
	var lastfilecollection = db.getCollection("lastfileplayed");
	var entryCount = lastfilecollection.count();
	var now = new Date();
	var lastaudio = "";
	var nextaudio = "";

	if (entryCount==0) {
		console.log("[TWITCHBOT EVENT] No files played yet");
		console.log("[TWITCHBOT EVENT] The file " + files_[0] + " will be played next.");
		lastaudio = "none";
		nextaudio = files_[0];
	} else {
		//lastaudiorec = lastfilecollection.find({'lastplayed':'correct'});
		lastaudiorec = lastfilecollection.get(1);
		console.log("[TWITCHBOT EVENT] Last file to have been played is : " + lastaudiorec.name);
		lastaudio = lastaudiorec.name;
		nextaudio = getNextFileToPlay(lastaudio);
		console.log("[TWITCHBOT EVENT] Next file to be played is : " + nextaudio);		
	}

	//Pretend sub event has happened and play file
	playFile(nextaudio);
	
	//Update database with filename played
	updateDbWithFilePlayed(nextaudio);
	
	// Twitch library options
	var options = {
		options: {
			debug: true
		},
		connection: {
			cluster: "aws",
			reconnect: true
		},
		identity: {
			username: "preachtwitchbot",
			password: "xxx"
		},
		channels: ["preachlfw"]
	};

	// Twitch client
	var client = new tmi.client(options);

	console.log("[TWITCHBOT EVENT] Connecting to channel preachlfw");
	
	client.connect();

	client.on('connected',function(address,port){
		console.log("[TWITCHBOT EVENT] Connected to address : " + address + " port : " + port);
	});

	client.on("disconnected", function (reason) {
	    console.log("[TWITCHBOT EVENT] Disconnected for Twitch with reason : " + reason);
	});

	client.on("subscription", function (channel, username, method, message, userstate) {
    	console.log("[TWITCHBOT EVENT] Subscription Event : " );
    	console.log("[TWITCHBOT EVENT] Channel : " + channel );
    	console.log("[TWITCHBOT EVENT] Username : " + username );
	});
}

