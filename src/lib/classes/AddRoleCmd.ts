import { EmbedBuilder } from "@discordjs/builders";
import { APIEmbed, ApplicationCommandOptionType } from "discord-api-types/v10";
import { CacheType, Client, CommandInteraction, DMChannel, GuildMember, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { logChannels } from "../../constants";
import SlashCommand, { BotCommand } from "./SlashCommands";

export class AddRoleCmd extends SlashCommand implements BotCommand {
  private readonly roleId: string;
  private readonly roleName: string;
  private logChannel: DMChannel | NewsChannel | TextChannel | null;

  constructor(roleId: string, roleName: string, roles: string[], bot: Client) {
    super(`add${roleName}`, bot, {
      description: `Geef een iemand de ${roleName} role`,
      roles,
      aliases: [],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: 'target',
          description: 'Wie moet er diene rol hebben?',
          required: true,
        }
      ]
    });
    this.roleId = roleId;
    this.roleName = roleName;
    this.logChannel = null;
  }

  private async getLogChannel() {
    const channel = await this.bot.channels.fetch(logChannels.roleChanges)
    if (!channel || !channel.isText() || (channel.isText() && channel.isThread()) || channel.partial) return;
    this.logChannel = channel;
  }

  private async sendLog(sender: GuildMember, target: GuildMember) {
    if (!this.logChannel) {
      await this.getLogChannel();
    }
    if (this.logChannel) {
      const logEmbed: APIEmbed = {
        title: `${this.roleName} assignment`,
        description: `<@${sender.id}>(${sender.user.username}) heeft <@${target.id}>(${target.user.username}) de ${this.roleName} role gegeven`,
        timestamp: new Date().toISOString(),
      }
      this.logChannel.send({ embeds: [logEmbed] })
    }
  }

  handleCmd(interaction: CommandInteraction<CacheType>) {
    if (!interaction.member) return;

    const target = interaction.options.getMember('target') as GuildMember;
    if (!target) return;
    target.roles.add(this.roleId);
    interaction.reply({
      content: `<@${target.id}> heeft de ${this.roleName} role ontvangen`,
      ephemeral: true
    })
    this.sendLog(interaction.member as GuildMember, target)
  }
}
