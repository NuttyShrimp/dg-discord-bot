import {Client, CommandInteraction, MessageEmbed} from "discord.js";
import SlashCommand, {BotCommand} from "../lib/classes/SlashCommands";
import {roleIds} from "../constants";

export class BotStat extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super('stats', bot, {
      description: "Check them statistics of the bot",
      roles: [roleIds.dev]
    });
  }

  handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;
    
    interaction.reply({
      embeds: [this.createEmbed()],
      ephemeral: true
    });
  }

  private createEmbed() {
    const embed = new MessageEmbed({
      color: '#E95578',
      title: 'Discord bot stats'
    });
    const stats = this.getStats();
    const fields = Object.entries(stats).map(stat => {
      return {
        inline: true,
        name: stat[0],
        value: `\`${stat[1]} MB\``
      };
    });
    embed.addFields(fields);
    return embed;
  }

  private getStats() {
    const used = process.memoryUsage();
    return {
      'heap Total': this.math(used.heapTotal),
      'heap Used': this.math(used.heapUsed),
    };
  }

  private math(num: number) {
    return Math.round(num / 1024 / 1024 * 100) / 100;
  }
}