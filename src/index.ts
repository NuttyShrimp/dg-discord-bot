import 'dotenv/config'
import "reflect-metadata"
import {deployCommands} from "./lib/classes/SlashCommands";
import {checkConfig, config} from "./lib/config";
import {bot, botCommands, botModules} from "./lib/botInfo";
import {AppDataSource} from "./db/source";
import './lib/botEvents';

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
