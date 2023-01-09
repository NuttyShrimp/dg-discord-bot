import {Module, BotModule} from "../lib/classes/AbstractModule";
import {ActivityType, Client} from "discord.js";
import axios from "axios";
import {FETCH_OPS, URL_SERVER} from "../constants";


export class PlayerCount extends Module implements BotModule {
  private plyFetchInterval: NodeJS.Timer | null = null;
  private activePlayers = 0;
  private queuedPlayers = 0;

  constructor(bot: Client) {
    super(bot);
  }

  private async fetchPlayerCount(): Promise<void> {
    try {
      const rawRes = await axios.get<ServerInformation>(`${URL_SERVER}/info.json`, FETCH_OPS);
      if (rawRes.status >= 400) {
        console.error(`Failed to fetch player count: ${rawRes.status} ${rawRes.statusText}`);
        return;
      }
      this.activePlayers = parseInt(rawRes.data.vars?.sv_queueConnectedCount ?? "0");
      this.queuedPlayers = parseInt(rawRes.data.vars?.sv_queueCount ?? "0");
      this.bot.user?.setPresence({
        status: "online",
        activities: [
          {
            type: ActivityType.Watching,
            name: `${this.activePlayers}(${this.queuedPlayers}) spelers`
          }
        ]
      });
    } catch (e: any) {
      // Just ignore these random errors
      if (e.code === "ECONNRESET") return;
      this.bot.user?.setPresence({
        status: "dnd",
        activities: [
          {
            type: ActivityType.Playing,
            name: "OFFLINE"
          }
        ]
      });
      // TODO: uncomment when pushing :)
      // console.error(e);
    }
  }

  start() {
    if (this.plyFetchInterval) {
      clearInterval(this.plyFetchInterval);
    }
    this.fetchPlayerCount();
    this.plyFetchInterval = setInterval(() => this.fetchPlayerCount(), 20000);
  }
}
