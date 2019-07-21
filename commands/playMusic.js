const search = require('youtube-search');
const ytdl = require('ytdl-core');

var opts = {
	maxResults: 10,
	key: 'AIzaSyCDHd_dOmLrAvClnQfvh56pJASBcT7eMOA'
};
const queue = new Map();
exports.play = play;

exports.exec = async (command, message, args) => {
	const serverQueue = queue.get(message.guild.id);

	if (command == '!p') {
		preparePlay(message, serverQueue, args);
		return;
	} else if (command == '!sk') {
		skip(message, serverQueue);
		return;
	} else if (command == '!st') {
		stop(message, serverQueue);
		return;
	}
}

async function preparePlay(message, serverQueue, args) {
	if (!message.member.voiceChannel) 
		return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = message.member.voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}
	var song, songInfo;
	if(args.split('http')[0] != ''){
		search(args, opts, async function(err, results) {
			if(err)
				return console.log(err);
			if(results != undefined){
				for(var i = 0; i < opts.maxResults; i++){
					if(results[i].kind == 'youtube#channel' || results[i].kind == 'youtube#playlist')
						continue;
					else{
						song = {
							title: results[i].title,
							url: ytdl(results[i].link)
						};
						queueSong(message, serverQueue, song);
						break;
					}
				}
			}
		});
	} else {
		if(ytdl.validateURL(args)){
			songInfo = await ytdl.getInfo(args);
			song = {
				title: songInfo.title,
				url: ytdl(songInfo.video_url)
			};
			queueSong(message, serverQueue, song);
		}
	}
}

async function queueSong(message, serverQueue, song){
	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: message.member.voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);
		queueContruct.songs.push(song);

		try {
			var connection = await message.member.voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(song.url)
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) 
		return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) 
		return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}
	