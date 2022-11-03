import SlashCommand, {BotCommand} from "../lib/classes/SlashCommands";
import {ChatInputCommandInteraction, Client, Message} from "discord.js";
import {ApplicationCommandOptionType} from "discord-api-types/v10";

export class Wiki extends SlashCommand implements BotCommand {
  private lastWikiMsg: Message | null = null;
  
  constructor(bot: Client) {
    super("wiki", bot, {
      description: "Maak reclame voor onze wiki!",
      roles: [],
      aliases: ["kiwi"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "target",
          description: "Wie moet er iere diene link hebben?",
        }
      ]     
    });
  }

  async handleCmd(interaction: ChatInputCommandInteraction) {
    if (!interaction.member) return;

    if (this.lastWikiMsg) {
      this.lastWikiMsg.delete();
    }
    
    this.lastWikiMsg = await interaction.reply({
      content: `EY <@${ interaction.options.getUser("target")?.id ?? interaction.user.id}>, check et ut op uzze wiki: <https://wiki.degrensrp.be/>`,
      fetchReply: true,
    }) as Message;
  }
}
