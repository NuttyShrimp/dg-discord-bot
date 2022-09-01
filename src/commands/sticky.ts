import SlashCommand, {BotCommand} from '../lib/classes/SlashCommands';
import {Client, CommandInteraction} from 'discord.js';
import {roleIds} from '../constants';
import {StickyMessages} from '../modules';

export class Sticky extends SlashCommand implements BotCommand {
  private stickyMessages: StickyMessages;

  constructor(bot: Client) {
    super('sticky', bot, {
      description: 'Create a sticky message',
      roles: [roleIds.dev, roleIds.staff],
      options: [
        {
          name: 'create',
          description: 'Create a sticky message',
          type: 1,
          options: [
            {
              name: 'message',
              description: 'The message to be sticky',
              required: true,
              type: 3,
            },
            {
              name: 'channel',
              description: 'The channel to send the message to',
              required: false,
              type: 7,
            }
          ]
        },
        {
          name: 'remove',
          description: 'Remove a sticky message',
          type: 1,
          options: [
            {
              name: 'channel',
              description: 'The channel to remove the sticky message from, Deletes from current channel if not specified',
              required: false,
              type: 7,
            }
          ]
        }
      ]
    });
    this.stickyMessages = StickyMessages.getInstance(bot);
  }
  
  private createNewStick(interaction: CommandInteraction) {
    const targetChannel = interaction.options.getChannel('channel')?.id ?? interaction.channel?.id;
    if (!targetChannel) {
      interaction.editReply({content: 'I couldn\'t find the channel you specified'});
      return;
    }
    const message = interaction.options.getString('message');
    if (!message) {
      interaction.editReply({content: 'You need to specify a message'});
      return;
    }
    try {
      this.stickyMessages.createNewStick(targetChannel, message);
  
      interaction.editReply({
        content: 'Sticky created successfully'
      });
    } catch (e) {
      console.error(e);
      this.stickyMessages.removeSticky(targetChannel);
      interaction.editReply({
        content: 'Something went wrong'
      });
    }
  }
  
  private async removeSticky(interaction: CommandInteraction) {
    const targetChannel = interaction.options.getChannel('channel')?.id ?? interaction.channel?.id;
    if (!targetChannel) {
      interaction.editReply({content: 'I couldn\'t find the channel you specified'});
      return;
    }
    await this.stickyMessages.removeSticky(targetChannel);
    interaction.editReply({content: `Removed sticky from <#${targetChannel}>`});
  }
  
  
  async handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;
    await interaction.deferReply({ephemeral: true});
    
    switch (interaction.options.getSubcommand()) {
      case 'create': {
        this.createNewStick(interaction);
        break;
      }
      case 'remove': {
        this.removeSticky(interaction);
        break;
      }
    }
  }
}