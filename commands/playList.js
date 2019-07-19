module.exports = class PlayList {
    constructor() {
        this.name = 'Play list - loaded', this.alias = ['playlist'], this.usage = ''
    }
    async run(message, args, db) {
		let command = args.split(' ', 1)[0];
		
		let arg = args.slice(command.length + 1);
		
		if(command == ''){
			let sql = 'SELECT id, Name FROM PlayList';
			var result = '';
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
			if(command == 'p'){
				var x = parseInt(arg, 10);
				let sql = 'SELECT URL, Name FROM PlayList WHERE id = ' + x;
				var result = '';
				db.all(sql, [], function(err, rows) {
					if (err)
						console.log(err);
						play(message.member.voiceChannel, rows[0].URL, rows[0].Name);
				});
			}
			if(command == 's'){
				let URL = arg.split(' ', 1)[0];
				let name = arg.slice(URL.length + 1);
				db.run('INSERT INTO PlayList(URL, Name) VALUES(?, ?)', [URL, name]);
			}
		}

		function play(voiceChannel, songLink, nowPlaying){
			voiceChannel.join().then(connection => {

				const dispatcher = connection.playStream(songLink);
				message.channel.send('Playing 🔥 ' + nowPlaying + ' 🔥');
				dispatcher.on("end", end => {
					console.log("left channel");
					voiceChannel.leave();
				});
			}).catch(err => console.log(err));
	}
	}
}
