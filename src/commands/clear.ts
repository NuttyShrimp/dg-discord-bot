import SlashCommand, {BotCommand, rest} from "../lib/classes/SlashCommands";
import {Client, CommandInteraction, MessageEmbed} from "discord.js";
import {roleIds} from "../constants";
import {Routes} from "discord-api-types/v10";

export class Clear extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super('clear', bot, {
      description: "Clear a certain amount of messages",
      roles: [roleIds.staff, roleIds.dev],
      options: [
        {
          name: 'amount',
          description: 'Amount of messages to delete',
          type: 4,
          max_value: 100,
          required: true
        }
      ],
      aliases: ['clean']
    });
  }

  handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;
    let amount = interaction.options.getInteger('amount');
    if (!amount) {
      interaction.reply({content: `You need to specify a number of messages to delete!`, ephemeral: true});
      return;
    }
    if (amount > 100) {
      amount = 100;
    }
    const channel = interaction.channel;
    if (!channel) return;
    // Get all messages
    channel.messages.fetch({limit: amount}).then(messages => {
      const msgIdsToDelete = messages.map(m => m.id);
      // Delete messages
      rest.post(Routes.channelBulkDelete(channel.id), {
        body: {
          messages: msgIdsToDelete
        }
      });
      interaction.reply({content: `Deleted ${amount} messages!`, ephemeral: true});
    });
  }
}