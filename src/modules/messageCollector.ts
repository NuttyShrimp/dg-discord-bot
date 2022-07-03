import {Module, BotModule, FilteredMessage} from "../lib/classes/AbstractModule";
import {Client, Interaction, Message, MessageEmbed, MessageEmbedAuthor, TextChannel, User} from "discord.js";
import {createMsgEmbed, parseAttachments} from "../lib/utils";

export class MessageCollector extends Module implements BotModule {
  private suggestionsChannel: TextChannel | null;
  private bugReportChannel: TextChannel | null;
  // TODO: Move this to the admin module
  private messageLogChannel: TextChannel | null;

  constructor(bot: Client) {
    super(bot);
    this.suggestionsChannel = null;
    this.bugReportChannel = null;
    this.messageLogChannel = null;
  }

  start() {
    Object.entries({
      [process.env.SUGGESTION_CHANNEL]: "suggestionsChannel",
      [process.env.BUG_RECEIVE_CHANNEL]: "bugReportChannel",
      [process.env.MESSAGELOGCHANNEL]: "messageLogChannel"
    }).forEach(([channelId, channel]) => {
      const _channel = this.bot.channels.cache.get(channelId);
      if (!_channel) {
        throw new Error('Suggestion channel not found');
      }
      if (_channel.partial || !(_channel instanceof TextChannel)) {
        throw new Error('Suggestion channel must be a text channel');
      }
      // @ts-ignore
      this[channel] = _channel;
    })
  }

  private handleBugReport(msg: FilteredMessage) {
    if (msg.channel.id !== process.env.BUG_SEND_CHANNEL) return;
    const photoURL = parseAttachments(msg);
    const author = msg.member.nickname ? msg.member.nickname : msg.author.tag
    try {
      msg.member.send({
        content: `We hebben je bug report goed ontvangen!\nHieronder staat een kopie van je bericht (zonder attachments)\n\n${msg.content}`,
      })
    } catch (e) {
      // We do not care about this failing
    }
    const embed = createMsgEmbed('Bug Report', msg.content, author, msg.author.displayAvatarURL(), photoURL)
    this.bugReportChannel?.send(embed).then(null).catch(console.error);
    return msg.delete();
  }

  private async handleSuggestion(msg: FilteredMessage) {
    if (msg.channel.id !== process.env.SUGGESTION_CHANNEL) return;
    if (msg.type.startsWith('THREAD')) return;
    const photoURL = parseAttachments(msg);
    const author = msg.member.nickname ? msg.member.nickname : msg.author.tag
    const embed = createMsgEmbed('Suggestie', msg.content, author, msg.author.displayAvatarURL(), photoURL)
    try {
      const embedMsg = await this.suggestionsChannel?.send(embed)
      if (embedMsg) {
        embedMsg.react('👍')
        embedMsg.react('👎')
      }
    } catch (e) {
      console.error(`Failed to handle suggestion`, e)
    } finally {
      msg.delete();
    }
  }

  private logMsg(msg: {
    author: User,
    content: string;
    title: string;
  }) {
    this.messageLogChannel?.send({
      embeds: [
        new MessageEmbed()
          .setColor('#E95578')
          .setAuthor({
            name: msg.author.tag,
            iconURL: msg.author.displayAvatarURL()
          })
          .setTitle(msg.title)
          .setDescription(msg.content)
      ]
    });
  }

  onMessage(msg: FilteredMessage) {
    // Cancer undocumented partial shit nobody wants to use or explain
    if (msg.channel.partial) return;
    if (msg.guild === null) return;
    this.handleSuggestion(msg);
    this.handleBugReport(msg);
    this.logMsg({
      author: msg.author,
      title: `Message send in #${(msg.channel as TextChannel).id}`,
      content: msg.content
    })
  }

  onInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    this.logMsg({
      author: interaction.user,
      title: `Command used in #${(interaction.channel as TextChannel).name}`,
      // I do not know if this includes subcommands
      content: interaction.commandName
    })
  }
}
