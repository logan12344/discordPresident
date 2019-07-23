const search = require('youtube-search'), ytdl = require('ytdl-core'), config = require('./../config.json');

const queue = new Map();
var opts = {
	maxResults: 10,
	key: config.googleApiToken
};

exports.exec = async (command, message, args, db) => {
	const serverQueue = queue.get(message.guild.id);
	let number = args.split(' ', 1)[0];
	let body = args.slice(number.length + 1);	
	if (command == '!p') {
		preparePlay(message, serverQueue, args);
		return;
	} else if (command == '!sk') {
		skip(message, serverQueue);
		return;
	} else if (command == '!l') {
		list(message, serverQueue);
		return;
	} else if (command == '!st') {
		stop(message, serverQueue);
		return;
	} else if(command == '!playlist'){
		if(number == ''){
			let sql = 'SELECT id, Name FROM PlayList';
			var result = 'List of tracks in playlist:\n';
			db.all(sql, [], function(err, rows) {
				if (err)
					console.log(err);
				rows.forEach(function(row) {
					result += '✨ '+ row.id + '. ' + row.Name + '\n';
				});
				message.channel.send(result);
			});
		}
		else{
			if(number == 'p'){
				let sql = 'SELECT URL, Name FROM PlayList WHERE id = ' + parseInt(body, 10);
				var song;
				db.all(sql, [], function(err, rows) {
					if (err)
						console.log(err);
					song = {
						title: rows[0].Name,
						url: rows[0].URL
					};
					queueSong(message, serverQueue, song);
					return;
				});
			}
			if(number == 's'){
				let URL = body.split(' ', 1)[0];
				let name = body.slice(URL.length + 1);
				db.run('INSERT INTO PlayList(URL, Name) VALUES(?, ?)', [URL, name]);
			}
		}
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
			playing: true
		};

		queue.set(message.guild.id, queueContruct);
		queueContruct.songs.push(song);

		try {
			var connection = await message.member.voiceChannel.join();
			queueContruct.connection = connection;
			message.channel.send('Playing 🔥 ' + song.title + ' 🔥');
			play(message, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		return message.channel.send('🎶 ' + song.title + ' 🎶 has been added to the queue!');
	}
}

function play(message, song) {
	const serverQueue = queue.get(message.guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(message.guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(song.url)
		.on('end', () => {
			console.log('Playing ' + song.title + ' ended!');
			message.channel.send('Playing ⏳ ' + song.title + ' ⏳ ended!');
			serverQueue.songs.shift();
			play(message, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) 
		return message.channel.send('🚧 You have to be in a voice channel to stop the music! 🚧');
	if (!serverQueue) 
		return message.channel.send('🛑 There is no song that I could skip! 🛑');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) 
		return message.channel.send('🚧 You have to be in a voice channel to stop the music! 🚧');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}	

function list(message, serverQueue) {
	var res = 'List of tracks in queue:\n';
	if(serverQueue == undefined){
		return message.channel.send('🚧 Queue is empty! 🚧');
	}
	for(var i = 0; i < serverQueue.songs.length; i++){
		res += '✨ ' + (i+1) + '. ' + serverQueue.songs[i].title + '\n';
	}
	message.channel.send(res);
}