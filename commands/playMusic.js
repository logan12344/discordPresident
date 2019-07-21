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
			if(results != undefined){
				for(var i = 0; i < opts.maxResults; i++){
					if(results[i].kind == 'youtube#channel' || results[i].kind == 'youtube#playlist')
						continue;
					else{
						stream = ytdl(results[i].link, { filter : 'audioonly' });
						nowPlaying = results[i].link;
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