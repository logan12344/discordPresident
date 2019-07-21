var kickVote = {};

exports.exec = async (message, args) => {
	var userChannelId = message.member.voiceChannelID;
	var userVotedID = args.split('@')[1];
	if(userVotedID.charAt(0) == '!')
		userVotedID = userVotedID.split('!')[1].split('>')[0];
	else
		userVotedID = userVotedID.split('>')[0];

	var userForKick = message.member.voiceChannel.members.find(user => user.id === userVotedID);
	var userChannelCount = message.member.voiceChannel.members.array().length;
	var userArray = {};
	
	if(kickVote[userChannelId] == undefined || kickVote[userChannelId].length == 0){
		userArray[userVotedID] = 1;
		
	}else{
		userArray = kickVote[userChannelId];
		userArray[userVotedID]++;
	}
	kickVote[userChannelId] = userArray;
	if(userArray[userVotedID] == userChannelCount-1){
		message.member.voiceChannel.overwritePermissions(userForKick, {'CONNECT' : false});
		setTimeout(function(user, channel){
			channel.overwritePermissions(user, {'CONNECT' : true});
		}, 10000, userForKick, message.member.voiceChannel);
		const temp_channel = await message.guild.createChannel('1', 'voice',
			[{ id: userForKick.id,
			deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']}
		]);
		await userForKick.setVoiceChannel(temp_channel);
		await temp_channel.delete();
		kickVote[userChannelId] = undefined;
	}
}