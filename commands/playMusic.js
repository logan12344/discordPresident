search = require('youtube-search');
const ytdl = require('ytdl-core');

var opts = {
	maxResults: 10,
	key: 'AIzaSyCDHd_dOmLrAvClnQfvh56pJASBcT7eMOA'
  };

exports.play = play;

exports.exec = async (message, args) => {
	if(args.split('http')[0] != ''){
		search(args, opts, async function(err, results) {
			if(err)
				return console.log(err);
			
			var links = JSON.parse(JSON.stringify(results));
			if(links != undefined){
				for(var i = 0; i < opts.maxResults; i++){
					if(links[i].kind == 'youtube#channel')
						continue;
					else{
						stream = ytdl(links[i].link, { filter : 'audioonly' });
						nowPlaying = links[i].link;
						break;
					}
				}
				play(message.member.voiceChannel, message.channel, stream, nowPlaying);
			}
		});
	} else {
		if(ytdl.validateURL(args)){
			stream = ytdl(args, { filter : 'audioonly' });
			nowPlaying = args;
		} else {
			stream = args;
			nowPlaying = args;
		}
		play(message.member.voiceChannel, message.channel, stream, nowPlaying);
	}
}

function play(voiceChannel, messageChannel, songLink, nowPlaying){
	voiceChannel.join().then(connection => {
		const dispatcher = connection.playStream(songLink);
		messageChannel.send('Playing 🔥 ' + nowPlaying + ' 🔥');
		dispatcher.on("end", end => {
			console.log("left channel");
			voiceChannel.leave();
		});
	}).catch(err => console.log(err));
}