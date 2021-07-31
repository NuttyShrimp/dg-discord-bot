const Discord = require('discord.js');

class BotStat {
	bot;
	constructor(bot) {
		this.bot = bot
		this.init()
	}
	init = () => {
		this.bot.on('message', (msg)=>{
			if (msg.author.bot) return
			if (!msg.member) return
			if (msg.content.includes('/stats')) {
				msg.channel.send(this.createEmbed())
			}
		})
	}
	createEmbed = () => {
		const embed = new Discord.MessageEmbed({
			color: '#E95578',
			title: 'Discord bot stats'
		})
		const stats = this.getStats()
		const fields = Object.entries(stats).map(stat=>{
			const field = {
				inline:true,
				name: stat[0],
				value: `\`${stat[1]} MB\``
			}
			return field
		})
		embed.addFields(fields)
		return embed
	}
	getStats = () => {
		const used = process.memoryUsage();
		const stats = {
			'heap Total': this.math(used['heapTotal']),
			'heap Used': this.math(used['heapUsed']),
		};
		return stats
	}
	math = (num) => Math.round(num / 1024 / 1024 * 100) / 100
}

module.exports = BotStat