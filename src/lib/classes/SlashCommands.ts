import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  CommandInteraction, GuildMemberRoleManager,
} from "discord.js";
import {Module} from "./AbstractModule";
import {
  APIApplicationCommandOption,
  RESTPostAPIApplicationCommandsJSONBody, Routes,
} from "discord-api-types/v10";
import {config} from "../config";
import {APIApplicationCommand} from "discord-api-types/payloads/v10";
import {REST} from "@discordjs/rest";

export const rest = new REST({version: "10"}).setToken(config.BOT_TOKEN);

declare interface SlashCommandOptions {
  description?: string;
  options?: APIApplicationCommandOption[];
  roles?: string[];
  aliases?: string[];
}

export interface BotCommand {
  readonly name: string;
  readonly description: string;
  readonly options: APIApplicationCommandOption[];
  readonly roles: string[];
  readonly aliases: string[];

  // eslint-disable-next-line no-unused-vars
  handleCmd: (interaction: ChatInputCommandInteraction) => void;
  // eslint-disable-next-line no-unused-vars
  canRunCMD: (interaction: ChatInputCommandInteraction) => boolean;
  toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
}

export default class SlashCommand extends Module implements BotCommand {
  readonly name: string;
  readonly description: string;
  readonly options: APIApplicationCommandOption[];
  readonly roles: string[] = [];
  readonly aliases: string[] = [];

  constructor(
    name: string,
    client: Client,
    options: SlashCommandOptions
  ) {
    super(client);
    this.name = name;
    this.description = options.description ?? "";
    this.options = options.options ?? [];
    this.roles = options.roles ?? [];
    this.aliases = options.aliases ?? [];
  }
  handleCmd(interaction: CommandInteraction<CacheType>) {
    // empty
  }

  toJSON(): RESTPostAPIApplicationCommandsJSONBody {
    return {
      name: this.name,
      description: this.description,
      options: this.options,
    };
  }

  canRunCMD(interaction: ChatInputCommandInteraction): boolean {
    // Check if user has one of the roles
    if (!interaction.member) return false;
    if (this.roles.length === 0) return true;
    if(!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => this.roles.includes(role.id))) {
      interaction.reply({
        content: "You don't have the required role to run this command",
        ephemeral: true,
      });
      return false;
    }
    return true;
  }
}

export const deployCommands = async (botCommands: BotCommand[]) => {
  try {
    const registerGuildCmds = (await rest.get(Routes.applicationGuildCommands(config.APPLICATION_ID, config.GUILD_ID))) as APIApplicationCommand[];
    const registerAppCmds = (await rest.get(Routes.applicationCommands(config.APPLICATION_ID))) as APIApplicationCommand[];

    const cmdsToDelete = registerGuildCmds.filter(cmd => {
      return !botCommands.find(botCmd => botCmd.name === cmd.name || botCmd.aliases.includes(cmd.name));
    });
    const cmdsToAdd: RESTPostAPIApplicationCommandsJSONBody[] = [];
    for (const botCmd of botCommands) {
      const cmdJson = botCmd.toJSON();
      if (!registerGuildCmds.find(cmd => cmd.name === botCmd.name)) {
        cmdsToAdd.push({...cmdJson});
      }
      if (botCmd.aliases) {
        botCmd.aliases.forEach(alias => {
          if (registerGuildCmds.find(cmd => cmd.name === alias)) return;
          cmdJson.name = alias;
          cmdsToAdd.push({...cmdJson});
        });
      }
    }

    for (const cmd of cmdsToDelete) {
      await rest.delete(Routes.applicationGuildCommand(config.APPLICATION_ID, config.GUILD_ID, cmd.id));
    }
    for (const cmd of registerAppCmds) {
      await rest.delete(Routes.applicationCommand(config.APPLICATION_ID, cmd.id));
    }
    console.log(`Deleted ${cmdsToDelete.length + registerAppCmds.length} commands`);

    for (const cmd of cmdsToAdd) {
      await rest.post(Routes.applicationGuildCommands(config.APPLICATION_ID, config.GUILD_ID), {body: cmd});
    }
    console.log(`Added ${cmdsToAdd.length} commands`);
  } catch (e) {
    console.error("Failed to register slashcommands", e);
  }
};
