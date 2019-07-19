search = require('youtube-search');
const ytdl = require('ytdl-core');

var opts = {
	maxResults: 10,
	key: 'AIzaSyCDHd_dOmLrAvClnQfvh56pJASBcT7eMOA'
  };

module.exports = class Music {
    constructor() {
        this.name = 'Play music - loaded', this.alias = ['p'], this.usage = 'play'
    }
    async run(message, args) {
		if(args.split('http')[0] != ''){
			search(args, opts, async function(err, results) {
				if(err)
					return console.log(err);
					var links = JSON.parse(JSON.stringify(results));
					play(message.member.voiceChannel, undefined, links);
			});
		}
		else
			play(message.member.voiceChannel, args);
	
		function play(voiceChannel, songLink, link){
				var stream, nowPlaying;
				voiceChannel.join().then(connection => {

					if(songLink != undefined && ytdl.validateURL(songLink)){
						stream = ytdl(songLink, { filter : 'audioonly' });
						nowPlaying = songLink;
					}

					if(link != undefined){
						for(var i = 0; i < opts.maxResults; i++){
							if(link[i].kind == 'youtube#channel')
								continue;
							else{
								stream = ytdl(link[i].link, { filter : 'audioonly' });
								nowPlaying = link[i].link;
								break;
							}
						}
					}
					else{
						stream = songLink;
					}

					const dispatcher = connection.playStream(stream);
					message.channel.send('Playing ' + nowPlaying);
					dispatcher.on("end", end => {
						console.log("left channel");
						voiceChannel.leave();
					});
				}).catch(err => console.log(err));
		}
	}
}
