import {BotModule, FilteredMessage, Module} from '../lib/classes/AbstractModule';
import {Client, ClientEvents, Message} from 'discord.js';
import {AppDataSource} from '../db/source';
import {StickyMessage} from '../db/entities/StickyMessage';

export class StickyMessages extends Module implements BotModule {
  private static instance: StickyMessages;

  public static getInstance(bot: Client): StickyMessages {
    if (!this.instance) {
      this.instance = new StickyMessages(bot);
    }
    return this.instance;
  }
  
  private stickyChannelMap: Map<string, {
    message: string,
    messageId: string,
  }>
  
  private messageDeleteByBot: Set<string>
  
  constructor(bot: Client) {
    super(bot);
    this.stickyChannelMap = new Map();
    this.messageDeleteByBot = new Set();
  }
  
  private async tryToRemoveSticky(channelId: string) {
    try {
      const sticky = this.stickyChannelMap.get(channelId);
      if (!sticky) return;
      // Get channel from discord
      const channel = await this.bot.channels.fetch(channelId)
      if (!channel) return;
      if (!channel.isText()) return;
      // Delete message
      const sMessage = await channel.messages.fetch(sticky.messageId)
      if (!sMessage) return;
      this.messageDeleteByBot.add(sMessage.id);
      await sMessage.delete();
    } catch (e: any) {
      // We do not care about Unkwown message
      if (e.message === 'Unknown Message') return;
      console.error('Error while trying to remove sticky', e);
    }
  }
  
  private async updateSticky(channelId: string) {
    const sticky = this.stickyChannelMap.get(channelId);
    if (!sticky) return;
    
    // Create new sticky
    const channel = await this.bot.channels.fetch(channelId)
    if (!channel) return;
    if (!channel.isText()) return;
    
    // Get last message in channel
    const lastMessage = (await channel.messages.fetch({ limit: 1 })).at(0);
    if (lastMessage?.id === sticky.messageId) return;
    
    // Delete old sticky
    await this.tryToRemoveSticky(channelId);
    const sMessage = await channel.send(sticky.message);
    this.stickyChannelMap.set(channelId, {
      message: sticky.message,
      messageId: sMessage.id,
    });
    // Update DB
    let newStickyMessage = await AppDataSource.manager.findOne(StickyMessage, {
      where: {
        channelId,
      }
    });
    if (!newStickyMessage) {
      newStickyMessage = new StickyMessage();
    }
    newStickyMessage.messageId = sMessage.id;
    AppDataSource.manager.save(newStickyMessage);
  }
  
  async createNewStick(channelId: string, message: string) {
    await this.tryToRemoveSticky(channelId);
    const channel = await this.bot.channels.fetch(channelId)
    if (!channel) return;
    if (!channel.isText()) return;
    const sMessage = await channel.send(message);
    this.stickyChannelMap.set(channelId, {
      message,
      messageId: sMessage.id,
    });
    // Save in DB
    const newStickyMessage = new StickyMessage();
    newStickyMessage.channelId = channelId;
    newStickyMessage.message = message;
    newStickyMessage.messageId = sMessage.id;
    AppDataSource.manager.save(newStickyMessage);
  }
  
  async removeSticky(channelId: string) {
    await this.tryToRemoveSticky(channelId);
    this.stickyChannelMap.delete(channelId);
    const sticky = await AppDataSource.manager.findOne(StickyMessage, {
      where: {
        channelId,
      },
    });
    if (!sticky) return;
    await AppDataSource.manager.remove(sticky);
  }
  
  async start() {
    const DBMessages = await AppDataSource.manager.find(StickyMessage)
    DBMessages.forEach(message => {
      this.stickyChannelMap.set(message.channelId, {
        message: message.message,
        messageId: message.messageId,
      });
    })
    this.stickyChannelMap.forEach((sticky, channelId) => {
      this.updateSticky(channelId);
    });
  }
  
  // This is not gonna work for bots, Gotta live with it
  async onMessage(message: FilteredMessage) {
    if (message.author.bot) return;
    this.updateSticky(message.channel.id);
  }
  
  async onEvent<T extends keyof ClientEvents>(event:T , ...args: ClientEvents[T]) {
    switch (event) {
      case 'messageDelete': {
        const message = args[0] as Message;
        const sticky = this.stickyChannelMap.get(message.channel.id);
        if (!sticky) return;
        if (sticky.messageId === message.id && !this.messageDeleteByBot.has(message.id)) {
          // Readd sticky, if it was deleted
          this.updateSticky(message.channel.id);
        }
      }
    }
  }
}