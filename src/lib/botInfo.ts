import { BotModule } from "./classes/AbstractModule";
import { BotCommand } from "./classes/SlashCommands";
import * as modules from "../modules";
import * as cmds from "../commands";
import Discord, { ClientOptions, GatewayIntentBits } from "discord.js";

const BOT_CONFIG: ClientOptions = { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent] };

export const bot = new Discord.Client(BOT_CONFIG);

export const botModules: BotModule[] = [];
export const botCommands: BotCommand[] = [];

// loop over modules
for (const bModule of Object.values(modules)) {
  // eslint-disable-next-line no-prototype-builtins
  if (bModule.hasOwnProperty("getInstance")) {
    // @ts-ignore
    botModules.push(bModule.getInstance(bot));
  } else {
    botModules.push(new bModule(bot));
  }
}

// loop over commands
for (const cmd of Object.values(cmds)) {
  botCommands.push(new cmd(bot));
}
