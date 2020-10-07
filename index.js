const Discord = require('discord.js');
const fetchTimeout = require('fetch-timeout');
const { TeamSpeak, QueryProtocol  } = require("ts3-nodejs-library")
require('dotenv').config();

const BOT_CONFIG = {
    'apiRequestMethod': 'sequential',
    'messageCacheMaxSize': 50,
    'messageCacheLifetime': 0,
    'messageSweepInterval': 0,
    'fetchAllMembers': false,
    'disableEveryone': true,
    'sync': false,
    'restWsBridgeTimeout': 5000, // check these
    'restTimeOffset': 300,
    'disabledEvents': [
      'CHANNEL_PINS_UPDATE',
      'TYPING_START'
    ],
}

const URL_SERVER = "http://146.59.145.65:30120";
const URL_PLAYERS = new URL('/players.json',URL_SERVER).toString();
const URL_INFO = new URL('/info.json',URL_SERVER).toString();
const FETCH_TIMEOUT = 900;
const FETCH_OPS = {
  'cache': 'no-cache',
  'method': 'GET',
  'headers': { 'User-Agent': `New-Brussel bot ${require('./package.json').version} , Node ${process.version} (${process.platform}${process.arch})` }
};
const PREFIX = "/"

const GetPlayers = function() {
    return new Promise((resolve,reject) => {
        fetchTimeout(URL_PLAYERS,FETCH_OPS,FETCH_TIMEOUT).then((res) => {
            res.json().then((players) => {
                resolve(players);
            }).catch(reject);
        }).catch(reject);
    })
}

const getVars = function() {
    return new Promise((resolve,reject) => {
        fetchTimeout(URL_INFO,FETCH_OPS,FETCH_TIMEOUT).then((res) => {
            res.json().then((info) => {
                resolve(info.vars);
            }).catch(reject);
        }).catch(reject);
    });
};



const teamspeak = new TeamSpeak({
    host: "146.59.145.65",
    protocol: QueryProtocol.RAW, //optional
    queryport: 10011, //optional
    serverport: 9987,
    username: process.env.QUERY_USER,
    password: process.env.QUERY_PASSWORD,
    nickname: "Discord Bot"
})

teamspeak.on("ready", () => {
    console.log('TS connected')
})

/* teamspeak.serverInfo().then(output => {
    console.log(output)
}) */

/* teamspeak.whoami().then(output => {
    console.log(output)
}) */

teamspeak.on("error", (e) => {
    console.log(e)
})

teamspeak.on("close", async () => {
    console.log("disconnected, trying to reconnect...")
    await teamspeak.reconnect(-1, 1000)
    console.log("reconnected!")
})

//DISCORD BOT
const bot = new Discord.Client(BOT_CONFIG);

bot.on('ready', function(){
    console.log("Bot started");
    bot.user.setActivity('0(0) spelers',{'type':'WATCHING'});
    bot.setInterval(() => {
        getVars().then((vars)=>{
            GetPlayers().then((players)=>{
                bot.user.setActivity(players.length+'('+(vars["sv_queueCount"]*1)+') spelers',{'type':'WATCHING'});
            }).catch(function(){
                bot.user.setActivity('OFFLINE',{'type':'WATCHING'})
            });
        }).catch(function(){
            bot.user.setActivity('OFFLINE',{'type':'WATCHING'})
        });
    }, 2500);
});

bot.on('message',async function(message){
    if (!message.author.bot) {
        if (message.member) {
            if (message.content.startsWith(PREFIX)){
                let command = message.content.substr(PREFIX.length)
                if(command === "status"){
                    var embed = new Discord.MessageEmbed()
                    .setColor("#E95578");
                    getVars().then((vars)=>{
                        teamspeak.serverInfo().then(output => {
                            embed
                            .setTitle('DeGrens RP is momenteel Online!')
                            .addField(
                                '**IP: **`cfx.re/join/lm9ax4`',
                                '**Tokovoip: **`degrensrp` \n**Spelers: **'+vars["sv_queueConnectedCount"]+'/'+vars["sv_maxClients"]+"\n**Teamspeak: **"+output.virtualserverClientsonline+"/"+output.virtualserverMaxclients+"\n**Queue: **"+vars["sv_queueCount"]
                            )
                            message.channel.send(embed).then((e)=>{
                                setTimeout(() => {
                                    message.delete();
                                    e.delete();
                                }, 10000);
                            });
                        })
                    }).catch(function(e){
                        console.log(e);
                        embed
                        .setTitle('DeGrens RP is momenteel Offline!')
                        message.channel.send(embed) 
                    })
                } else if(command === "socials" || command === "social"){
                    var embed = new Discord.MessageEmbed()
                    .setColor("#E95578")
                    .setTitle('DeGrens op social media!')
                    .addFields(
                        {name: "Twitter", value: "https://twitter.com/GrensRp"},
                    );
                    message.channel.send(embed).then((e)=>{
                        setTimeout(() => {
                            message.delete();
                            e.delete();
                        }, 10000);
                    });
                } else if(command === "f8"){
                    message.channel.send('Je kunt joinen via f8 joinen via de volgende adressen:\ncfx.re/join/lm9ax4\ndegrens.nuttyshrimp.me *backup*')
                } else if(command === "patreon" || command === "doneren" || command === "donate"){
                    var embed = new Discord.MessageEmbed()
                    .setColor("#E95578")
                    .setTitle('Steun DeGrens!')
                    .addFields(
                        {name: "Steun ons d.m.v. een patreon subscription", value: "https://www.patreon.com/DEGRENSRP"},
                    );
                    message.channel.send(embed).then((e)=>{
                        setTimeout(() => {
                            message.delete();
                            e.delete();
                        }, 10000);
                    });
                }
            };
        };
    };
});

bot.login(process.env.BOT_TOKEN);
