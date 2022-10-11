import {Client, ClientEvents, GuildMember, Interaction, Message} from "discord.js";

export type FilteredMessage = Message & {
  readonly member: GuildMember;
}

export interface BotModule {
  /**
   * A function that is called when the bot started and is connected
   * to discord services
   */
  start?: () => void;

  // eslint-disable-next-line no-unused-vars
  onMessage?: (msg: FilteredMessage) => void;

  // eslint-disable-next-line no-unused-vars
  onInteraction?: (msg: Interaction) => void;
  
  // eslint-disable-next-line no-unused-vars
  onEvent?: <T extends keyof ClientEvents>(event:T , ...args: ClientEvents[T]) => void;
}


export abstract class Module {
  protected bot: Client;

  protected constructor(bot: Client) {
    this.bot = bot;
  }

}