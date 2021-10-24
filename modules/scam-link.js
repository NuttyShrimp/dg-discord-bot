const { doesMessageContain} = require('../utils');

class ScamLinks {
	bot;
	scamLinks = [];
	recentInfectedWarnings = [];
	constructor(bot) {
		this.bot = bot
		this.fetchList();
		this.startBot();
	}
	async fetchList() {
		let link = 'https://raw.githubusercontent.com/DevSpen/links/master/src/links.txt';
		let response = await fetch(link);
		let text = await response.text();
		this.scamLinks = text.split('\n');
		console.log(`Loaded ${this.scamLinks.length} scam links`);
	}
	async startBot() {
		this.bot.on('message', this.messageHandler.bind(this));
	}
	async messageHandler(msg) {
		if (msg.author.bot) return;
		if (msg.channel.type == 'dm') return;
		if (typeof msg.content === 'undefined'){
			console.error('Undefined message content:');
			return;
		}
		if (doesMessageContain(msg.content, this.scamLinks)) {
			if(msg.channel.type === 'dm' || msg.deleted) return;
			msg.delete().catch(()=>{});
			if(!this.recentInfectedWarnings.includes(msg.author.id)){
				this.recentInfectedWarnings.push(msg.author.id);
				msg.channel.send(`<@${msg.author.id}> was infected by a malware that tried to spread itself in this guild`);
			}
			return;
		}
	}
}

module.exports = ScamLinks