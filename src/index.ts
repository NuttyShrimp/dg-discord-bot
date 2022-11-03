import "dotenv/config";
import "reflect-metadata";
import {deployCommands} from "./lib/classes/SlashCommands";
import {checkConfig, config} from "./lib/config";
import {bot, botCommands, botModules} from "./lib/botInfo";
import {AppDataSource} from "./db/source";
import * as Sentry from "@sentry/node";
import "./lib/botEvents";
import { patreonRoles } from "./modules/patreonRoles";

Sentry.init({
  dsn: "https://e956f2798bfc4b7d89f14f6e0880eb2e@sentry.nuttyshrimp.me/13",
  tracesSampleRate: 1.0,
});

checkConfig();

AppDataSource.initialize().then(() => {
  bot.login(config.BOT_TOKEN);
}).catch(console.error);

bot.on("ready", function () {
  console.log("Bot started");
  botModules.forEach(bModule => {
    if (bModule.start) {
      bModule.start();
    }
  });
  console.log(`Started ${botModules.length} modules`);
  patreonRoles.initialize();
});

(async () => {
  deployCommands([]);
  deployCommands(botCommands);
})();
