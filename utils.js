const Discord = require('discord.js');

const parseAttachments = (message, _msg) => {
	const msg = _msg || message.content
	if (message.attachments.size > 0) {
		for (const attachment of message.attachments.entries()) {
			const img = attachment[1];
			if (['.jpg', '.png', '.gif', '.jpeg', '.bmp'].includes(path.extname(img.name.toLowerCase()))) {
				msg += '\n' + img.url;
			}
		}
	}
	return msg;
}

const createMsgEmbed = (title, msg, author, authorimg) => {
	let embed = new Discord.MessageEmbed()
	.setAuthor(author, authorimg)
	.setColor('#E95578')
	.setTitle(title)
	.setDescription(msg)
	.setTimestamp(new Date());
	return embed;
}

const doesMessageContain = (message='', dict=[]) => {
	const lowerMsg = message.toLowerCase();
	return !!dict.find(w => lowerMsg.includes(w));
}

module.exports = {
	parseAttachments,
	createMsgEmbed,
	doesMessageContain
}