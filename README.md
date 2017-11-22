# preachtwitchbot
The purpose of this project is:

+ **Twitch API** - Connect to a Twitch.tv channel and capture the subscription events
+ **nodejs fs** - Load a list of files from a folder on the clientside and order them according to filename which is in a known format 00000.*
+ **LokiJS** - Only load and play a file from the list in the event of a subscription via Twitch API (in order, without repeating)
+ **LokiJS** - Remember the last file played and carry on from that position after restart

# Dependencies

This currently makes use of the twitch api : 

```bash
npm install tmi --save
```

as well as LokiJS for the client side JSON DB : 

```bash
npm install lokijs --save 
```

and of course Node.js

https://nodejs.org/en/download/