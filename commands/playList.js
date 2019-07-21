const player = require('./playMusic');

exports.exec = async (message, args, db) => {
	let command = args.split(' ', 1)[0];	
	let arg = args.slice(command.length + 1);
	const serverQueue = queue.get(message.guild.id);	
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
			var result = '', song;
			db.all(sql, [], function(err, rows) {
				if (err)
					console.log(err);
				song = {
					title: rows[0].Name,
					url: rows[0].URL
				};
				player.queueSong(message, serverQueue, song);
			});
		}
		if(command == 's'){
			let URL = arg.split(' ', 1)[0];
			let name = arg.slice(URL.length + 1);
			db.run('INSERT INTO PlayList(URL, Name) VALUES(?, ?)', [URL, name]);
		}
	}
}