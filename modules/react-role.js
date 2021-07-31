class Reactrole {
	bot;
	channel;
	channelid;
	lastmsg;
	collector;
	constructor(bot) {
		this.bot = bot;
		this.channelid = process.env.UITLEGCHANNEL
		this.init()
	}
	init = async () => {
		this.channel = await this.bot.channels.fetch(this.channelid)
		if (!this.channel) {
			throw new Error(`Channel(${this.channelid}) doesn't exist`)
		}
		this.lastmsg = (await this.channel.messages.fetch({limit: 1})).first()
		this.lastmsg.react('✅')
		this.collector = this.lastmsg.createReactionCollector(this.reactionFilter, {});
		this.startCollector()
	}
	getUser = async (user) => (await this.channel.guild.members.fetch(user))
	reactionFilter = async (reaction, user) => {
		// console.log(reaction.users.find(), user.id);
		return reaction.emoji.name == '✅' && !((await this.getUser(user))._roles.includes(process.env.RAECT_ROLE_ID))
	};
	startCollector = () => {
		this.collector.on('collect', async (_, u) => {
			const guildMember =	await this.getUser(u)
			guildMember.roles.add(process.env.RAECT_ROLE_ID)
		} );
	}
}

module.exports = Reactrole