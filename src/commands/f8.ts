import SlashCommand, {BotCommand} from '../lib/classes/SlashCommands';
import {Client, CommandInteraction} from 'discord.js';

export class F8 extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super('f8', bot, {
      description: 'Check hoe je de server kunt joinen',
      roles: []
    });
  }

  handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;

    interaction.reply({
      content: 'Druk F8 in FiveM --> `connect play.degrensrp.be`',
      ephemeral: true
    });
  }
}