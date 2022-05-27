import {bot, botCommands, botModules} from "./botInfo";
import {ClientEvents, Interaction, Message, PartialMessage} from "discord.js";
import {FilteredMessage} from "./classes/AbstractModule";

const dispatchEvent = <T extends keyof ClientEvents>(event: T, ...args: ClientEvents[T]) => {
  botModules.forEach(bModule => {
    if (bModule.onEvent) {
      try {
        bModule.onEvent(event, ...args);
      } catch (e) {
        console.error(`Error in module ${bModule?.constructor?.name} on event ${event}`, e);
      }
    }
  });
}

bot.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.member) return;
  dispatchEvent('messageCreate', message);
  botModules.forEach(bModule => {
    if (bModule.onMessage) {
      try {
        bModule.onMessage(message as FilteredMessage);
      } catch (e) {
        console.error(`Error in module ${bModule?.constructor?.name} on event messageCreate (onMessage)`, e);
      }
    }
  });
})

bot.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.user.bot) return;

  botModules.forEach(bModule => {
    if (bModule.onInteraction) {
      try {
        bModule.onInteraction(interaction);
      } catch (e) {
        console.error(`Error in module ${bModule?.constructor?.name} on event interactionCreate (onInteraction)`, e);
      }
    }
  });
  dispatchEvent('interactionCreate', interaction);

  if (!interaction.isCommand()) return;
  // Only handles commands from this point
  botCommands.forEach(cmd => {
    if (cmd.name !== interaction.commandName && !cmd.aliases.includes(interaction.commandName)) return
    if (!cmd.canRunCMD(interaction)) return
    try {
      cmd.handleCmd(interaction);
    } catch (e) {
      console.error(`Error in cmd handler of ${cmd.name} on event interactionCreate (handleCmd)`, e);
    }
  });
})

bot.on('messageDelete', (message: Message | PartialMessage) => {
  if (message.partial) return;
  dispatchEvent('messageDelete', message);
})