const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db_path = __dirname+'/Bot.db';
const playlist = require('./commands/playList');
const player = require('./commands/playMusic');
const KickUser = require('./commands/KickUser');

const client = new Discord.Client();

if (fs.existsSync(db_path)) {
	var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, function(err) {
		if (err)
			console.log(err.message);
		else
			console.error('Connected to the Bot database.');
	});
} else {
    console.log("not found")
}

client.once('ready', async () => {
   client.user.setActivity('Посади корупціонера', { type: 'PLAYING' });
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', (message) => {
    if (message.author.type != 'bot' && message.channel.type != 'dm') {
        let command = message.content.split(' ', 1)[0];
        let args = message.content.slice(command.length + 1);
        
        switch (command) {
            case '!playlist':
            case '!p':
            case '!sk':
            case '!st':
                player.exec(command, message, args, db);
                break;
            case '!lustration':
            case '!amnesty':
            case '!k':
                KickUser.exec(command, message, args);
                break;
            default:
                if (command.slice(0,1) == '!'){
                    message.channel.send('Usage:\n !p - play \n !sk - skip \n !st - stop \n !k - vote for user kick from voice channel');
                }
        }
    }
});

client.login('NjAwNzI1NDc5MzIxNzYzODQz.XS7WqA.DtyzQXbmoylquXf90aj_aDLeurk');