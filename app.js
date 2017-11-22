// npm install tmi.js --save
// npm install lokijs --save
// Twitch library
var tmi = require('tmi.js');
var loki = require('lokijs');
var fs = require('fs');
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
console.log("[TWITCHBOT EVENT] Load / Create localised storage");
var db = new loki('subaudiohistorylist.json', {persistenceMethod:'fs', autoload: true, autoloadCallback: loadHandler});

function loadHandler() {
  var subaudiohistorylist = db.getCollection('subaudiohistorylist');

  if (!subaudiohistorylist) {
    subaudiohistorylist = db.addCollection('subaudiohistorylist');
  }

  db.saveDatabase();
};


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

