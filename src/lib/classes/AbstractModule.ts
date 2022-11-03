import {BaseInteraction, Client, ClientEvents, GuildMember, Message} from "discord.js";

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
  onInteraction?: (msg: BaseInteraction) => void;
  
  // eslint-disable-next-line no-unused-vars
  onEvent?: (event:string , ...args: any[]) => void;
}


export abstract class Module {
  protected bot: Client;

  protected constructor(bot: Client) {
    this.bot = bot;
  }

}
