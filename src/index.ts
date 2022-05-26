import 'dotenv/config'
import "reflect-metadata"
import {Interaction, Message, PartialMessage} from "discord.js";
import {FilteredMessage} from "./lib/classes/AbstractModule";
import {deployCommands} from "./lib/classes/SlashCommands";
import {checkConfig, config} from "./lib/config";
import {bot, botCommands, botModules} from "./lib/botInfo";
import {AppDataSource} from "./db/source";

checkConfig();

deployCommands(botCommands);

AppDataSource.initialize().then(() => {
  bot.login(config.BOT_TOKEN);
}).catch(console.error)

bot.on('ready', function () {
  console.log('Bot started');
  botModules.forEach(bModule => {
    if (bModule.start) {
      bModule.start();
    }
  });
  console.log(`Started ${botModules.length} modules`);
});

bot.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.member) return;
  botModules.forEach(bModule => {
    if (bModule.onMessage) {
      bModule.onMessage(message as FilteredMessage);
    }
    if (bModule.onEvent) {
      bModule.onEvent('messageCreate', message);
    }
  });
})

bot.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.user.bot) return;

  botModules.forEach(bModule => {
    if (bModule.onInteraction) {
      bModule.onInteraction(interaction);
    }
    if (bModule.onEvent) {
      bModule.onEvent('interactionCreate', interaction);
    }
  });

  if (!interaction.isCommand()) return;
  // Only handles commands from this point
  botCommands.forEach(cmd => {
    if (cmd.name !== interaction.commandName && !cmd.aliases.includes(interaction.commandName)) return
    if (!cmd.canRunCMD(interaction)) return
    cmd.handleCmd(interaction);
  });
})

bot.on('messageDelete', (message: Message | PartialMessage) => {
  if (message.partial) return;
  botModules.forEach(bModule => {
    if (bModule.onEvent) {
      bModule.onEvent('messageDelete', message);
    }
  });
})