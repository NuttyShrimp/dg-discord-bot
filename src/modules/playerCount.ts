import {Module, BotModule} from "../lib/classes/AbstractModule";
import {Client} from "discord.js";
import fetch from 'node-fetch';
import {FETCH_OPS, URL_SERVER} from "../constants";


export class PlayerCount extends Module implements BotModule {
  private plyFetchInterval: NodeJS.Timer | null = null;
  private activePlayers: number = 0;
  private queuedPlayers: number = 0;

  constructor(bot: Client) {
    super(bot);
  }

  private async fetchPlayerCount(): Promise<void> {
    try {
      const rawRes = await fetch(`${URL_SERVER}/info.json`, FETCH_OPS);
      if (!rawRes.ok) {
        console.error(`Failed to fetch player count: ${rawRes.status} ${rawRes.statusText}`);
      }
      const res = await rawRes.json() as ServerInformation;
      this.activePlayers = parseInt(res.vars?.sv_queueConnectedCount ?? 0);
      this.queuedPlayers = parseInt(res.vars?.sv_queueCount ?? 0);
      this.bot.user?.setPresence({
        status: 'online',
        activities: [
          {
            type: 'WATCHING',
            name: `${this.activePlayers}(${this.queuedPlayers}) spelers`
          }
        ]
      })
    } catch (e) {
      this.bot.user?.setPresence({
        status: 'dnd',
        activities: [
          {
            type: 'PLAYING',
            name: `OFFLINE`
          }
        ]
      })
      console.error(e);
    }
  }

  start() {
    if (this.plyFetchInterval) {
      clearInterval(this.plyFetchInterval);
    }
    this.fetchPlayerCount()
    this.plyFetchInterval = setInterval(() => this.fetchPlayerCount(), 2500);
  }

}