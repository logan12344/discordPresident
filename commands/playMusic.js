search = require('youtube-search');
const ytdl = require('ytdl-core');

var opts = {
	maxResults: 10,
	key: 'AIzaSyCDHd_dOmLrAvClnQfvh56pJASBcT7eMOA'
};
const queue = new Map();
exports.play = play;

exports.exec = async (command, message, args) => {
	const serverQueue = queue.get(message.guild.id);
	if(command == '!p'){
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel)
			return message.channel.send('You need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
			return message.channel.send('I need the permissions to join and speak in your voice channel!');
		}
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
					play(message, stream, nowPlaying, serverQueue);
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
			play(message, stream, nowPlaying, serverQueue);
		}
	}

	if(command == '!sk'){
		skip(message, serverQueue);
	}

	if(command == '!st'){
		stop(message, serverQueue);
	}
}

async function play(message, songLink, nowPlaying, serverQueue){
	const voiceChannel = message.member.voiceChannel;
	const messageChannel = message.channel;
	if (!serverQueue) {
		const queueContruct = {
			connection: null,
			songs: [],
			playing: true
		};
		queue.set(message.guild.id, queueContruct);
		queueContruct.songs.push(songLink);
		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			messageChannel.send('Playing 🔥 ' + nowPlaying + ' 🔥');
			playMusic(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(songLink);
		return message.channel.send(nowPlaying + ' has been added to the queue!');
	}
}
 
function playMusic(guild, song){
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(song)
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			playMusic(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
		dispatcher.setVolumeLogarithmic(5 / 5);
}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel)
		return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) 
		return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) 
	return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}