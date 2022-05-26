import {BotModule, FilteredMessage, Module} from "../lib/classes/AbstractModule";
import {Client} from "discord.js";
import {doesMessageContain} from '../lib/utils'
import fetch from "node-fetch";

export class AntiScamLinks extends Module implements BotModule {
  scamLinks: string[] = [];
  recentInfectedWarnings: string[] = [];

  constructor(bot: Client) {
    super(bot);
    this.fetchList();
  }

  async fetchList() {
    let link = 'https://raw.githubusercontent.com/DevSpen/links/master/src/links.txt';
    let response = await fetch(link);
    let text = await response.text();
    this.scamLinks = text.split('\n');
    console.log(`Loaded ${this.scamLinks.length} scam links`);
  }

  async onMessage(msg: FilteredMessage) {
    if (msg.author.bot) return;
    // get all URL in msg.content
    let urls = msg.content.match(/(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    urls?.forEach(url => {
      // Remove http(s)://
      url = url.replace(/^https?:\/\//, '');
      // Remove www.
      url = url.replace(/^www\./, '');
      // Remove trailing slash
      url = url.replace(/\/$/, '');
      if (doesMessageContain(url, this.scamLinks)) {
        msg.delete();
        if (!this.recentInfectedWarnings.includes(msg.author.id)) {
          this.recentInfectedWarnings.push(msg.author.id);
          msg.channel.send(`<@${msg.author.id}> was infected by a malware that tried to spread itself in this guild`);
        }
      }
    });
  }
}