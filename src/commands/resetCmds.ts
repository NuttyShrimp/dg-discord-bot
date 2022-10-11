import SlashCommand, {BotCommand, deployCommands} from "../lib/classes/SlashCommands";
import {Client, CommandInteraction} from "discord.js";
import {roleIds} from "../constants";
import {botCommands} from "../lib/botInfo";

export class ResetCmds extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super("refreshcmds", bot, {
      description: "Reset them slash commands, do not touch if you are not nuttyshrimp",
      roles: [roleIds.dev]
    });
  }

  async handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;
    console.log(`${interaction.user.username} is trying to reset the commands`);
    await interaction.deferReply({ephemeral: true});
    await deployCommands([]);
    await deployCommands(botCommands);
    interaction.editReply({
      content: "SlashCommands should be refreshed",
    });
  }
}
