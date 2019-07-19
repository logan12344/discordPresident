const Discord = require('discord.js');
const client = new Discord.Client();
const {CommandHandler} = require('djs-commands');
const sqlite3 = require('sqlite3').verbose(), fs = require('fs');

const handler = new CommandHandler({
    folder: __dirname + '/commands/',
    prefix: ['!']
});
const queue = new Map();

if (fs.existsSync('./Bot.db')) {
	db = new sqlite3.Database('./Bot.db', sqlite3.OPEN_READWRITE, function(err) {
		if (err)
			console.log(err.message);
		else
			console.log('Connected to the Bot database.');
	});
}

client.on('ready', async () => {
   client.user.setActivity('Посади корупціонера', { type: 'PLAYING' });
});

client.on('message', (message) => {
    if (message.author.type != 'bot' && message.channel.type != 'dm') {
        let command = message.content.split(' ', 1)[0];
        let args = message.content.slice(command.length + 1);
        if (handler.getCommand(command)) {
            handler.getCommand(command).run(message, args, db);
        }
    }
});

client.login('NjAwNzI1NDc5MzIxNzYzODQz.XS7WqA.DtyzQXbmoylquXf90aj_aDLeurk');