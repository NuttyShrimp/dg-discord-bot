import {BotModule, Module} from "../lib/classes/AbstractModule";
import {Client, GuildMember, Message, MessageReaction, ReactionCollector, Role, TextChannel, User} from "discord.js";

export class ReactRole extends Module implements BotModule {
  private channel: TextChannel | null;
  private lastmsg: Message | undefined;
  private collector: ReactionCollector | undefined;
  private reactionRole: Role | null;

  constructor(bot: Client) {
    super(bot)
    this.channel = null;
    this.lastmsg = undefined;
    this.collector = undefined;
    this.reactionRole = null;
  }

  async start() {
    // Get channel where reaction msg comes
    const _channel = await this.bot.channels.fetch(process.env.UITLEGCHANNEL)
    if (_channel?.partial || !(_channel instanceof TextChannel)) {
      throw new Error('Suggestion channel must be a text channel');
    }
    this.channel = _channel;
    if (!this.channel) {
      throw new Error(`Channel(${process.env.UITLEGCHANNEL}) doesn't exist`)
    }
    
    // Get last message where to react to
    this.lastmsg = (await this.channel.messages.fetch({limit: 1})).first()
    if (!this.lastmsg) return;
    this.lastmsg.react('✅')
    
    this.reactionRole = await this.bot.guilds.cache.get(process.env.GUILD_ID)?.roles.fetch(process.env.REACT_ROLE_ID) ?? null
    if (!this.reactionRole) {
      throw new Error(`Role(${process.env.REACT_ROLE_ID}) doesn't exist`)
    }
    
    this.createCollector()
  }

  private getUser = (user: User): Promise<GuildMember> | undefined => (this.channel?.guild.members.fetch(user));
  
  private reactionFilter = async (reaction: MessageReaction, user: User) => {
    return reaction.emoji.name == '✅' && !((await this.getUser(user))?.roles?.cache.has(process.env.REACT_ROLE_ID))
  };
  
  private createCollector = () => {
    this.collector = this.lastmsg?.createReactionCollector({
      filter: this.reactionFilter.bind(this),
    });
    if (!this.collector) {
      throw new Error(`Failed to create reaction collector for react role msg`)
    }
    this.collector?.on('collect', async (_, u) => {
      const guildMember = await this.getUser(u)
      guildMember?.roles.add(this.reactionRole as Role);
    });
  }
}