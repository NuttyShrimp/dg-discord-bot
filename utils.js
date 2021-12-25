const Discord = require('discord.js');
const path = require('path');

const parseAttachments = (message, _msg) => {
	if (message.attachments.size > 0) {
		for (const attachment of message.attachments.entries()) {
			const img = attachment[1];
			if (['.jpg', '.png', '.gif', '.jpeg', '.bmp'].includes(path.extname(img.name.toLowerCase()))) {
				return img.url;
			}
		}
	}
}

const createMsgEmbed = (title, msg, author, authorimg, msgImage) => {
	let embed = new Discord.MessageEmbed()
	.setAuthor(author, authorimg)
	.setColor('#E95578')
	.setTitle(title)
	.setDescription(msg)
	.setTimestamp(new Date());
	if (msgImage) embed.setImage(msgImage);
	return embed;
}

const doesMessageContain = (message='', dict=[]) => {
	const lowerMsg = message.toLowerCase();
	return !!dict.find(w => lowerMsg === w.toLowerCase());
}

module.exports = {
	parseAttachments,
	createMsgEmbed,
	doesMessageContain
}