import SlashCommand, { BotCommand } from "../lib/classes/SlashCommands";
import { Client, CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { BETA_TEST, roleIds } from "../constants";
import { APIEmbed } from "discord-api-types/v10";
import axios from "axios";

export class BetaInfo extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super("showbetainfo", bot, {
      description: "show information about test evt",
      roles: [roleIds.dev]
    });
  }

  handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;

    const infoEmbed: APIEmbed = {
      title: "DeGrens 2.0 Test event",
      color: 0xE95578,
      fields: [
        {
          name: "Wanneer",
          value: "vanaf 17/11/2022 - 20u CET/UTC+1, tot de devs het stop zetten (lees als vrijdag ochtend)",
        },
        {
          name: "Enkele afspraken",
          value: "Je streamt deze test **NIET**, (ook niet onder de vriendjes)\nAlle bugs dienen gemeld te worden\nEr worden geen opnames gedeeld buiten de daarvoor bestemde upload zone",
        },
        {
          name: "Hoe gaat da in zijne gang",
          value: "Je zal een whitelist krijgen op `dg2.nuttyshrimp.me`. Hier zal je dingen op kunnen uittesten tot als de devs zeggen dat het stopt.\nAls je een bug tegenkomt ga je deze het `reportbug` discord command kunnen toevoegen aan een speciaal trello board. Hier op kan je zien wat al dan niet gezien wordt als een bug. We vertrouwen jullie om de link naar het trello board niet te delen met derdes die niet uitgenodigd zijn voor dit test event."
        },
        {
          name: "Wat verwachten we van u",
          value: "Je houdt je bezig met het zoeken naar rare functionaliteiten en dingen die niet correct zijn\nWe vragen ook (indien mogelijk) je gehele sessie op de op te nemen met OBS en daarna te uploaden in de drop zone. Je kunt deze opname daarna gebruiken om naar bepaalde timestamp te referen bij het melden van een bug.\nAls laatste vragen we om de onderstaande spreadsheet in te vullen als je een van de activiteiten doet. Dit helpt ons bij het rechttrekken en bepalen van de economie. Als je een activiteit in groep doet hoeft maar 1 persoon deze spreadsheet in te vullen. Hou er rekening mee dat elke activiteit logs heeft dus de echtheid van elke entry kan en zal gecontroleerd worden!"
        },
        {
          name: "Wat moet je niet testen?",
          value: `We hebben enkele onderdelen nog niet aangepast/herschreven of toegevoegd. Hieronder vindt je de lijst:
            - Housing
            - Ambulance
            - Kleding
            - Custom kleding
            - Emergency vehicles
            - Racing
            - Prison (kleine kans)
          `,
        },
        {
          name: "Links",
          value: "**upload zone**: https://nextcloud.nuttyshrimp.me/s/ZmPfwCfFSK6qcoR\n**Trello board**: https://trello.com/b/CFRUxcPS/dg-test-evt\n**Activiteiten sheet**: https://docs.google.com/spreadsheets/d/12HIFMsoRskVkwkAbMLpf8hq40mJ9lJIuUIbYD3ihAGk/edit?usp=sharing"
        }
      ]
    };

    interaction.channel.send({
      embeds: [infoEmbed]
    });
    interaction.reply({
      content: "done",
      ephemeral: true
    });
  }
}

export class AddBetaParticipants extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super("addbetaparticipants", bot, {
      description: "Add participant to beta test channel",
      roles: [roleIds.dev]
    });
  }

  handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;

    if (!interaction.channel.isTextBased() || interaction.channel.isThread() || interaction.channel.isDMBased()) return;
    for (const participant of BETA_TEST.participants) {
      interaction.channel.permissionOverwrites.edit(participant, { SendMessages: true, ViewChannel: true, CreateInstantInvite: false, SendMessagesInThreads: true, CreatePrivateThreads: false, EmbedLinks: true, AttachFiles: false });
    }

    interaction.reply({
      content: "done"
    });
  }
}

export class AddBetaParticipantsVoice extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super("addbetaparticipantsvoice", bot, {
      description: "Add participant to beta test channel",
      roles: [roleIds.dev]
    });
  }

  async handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;

    const channel = await this.bot.channels.fetch("1042531462123094046");
    if (!channel.isVoiceBased()) return;
    for (const participant of BETA_TEST.participants) {
      channel.permissionOverwrites.edit(participant, { SendMessages: true, ViewChannel: true, CreateInstantInvite: false, SendMessagesInThreads: true, CreatePrivateThreads: false, EmbedLinks: true, AttachFiles: false });
    }

    interaction.reply({
      content: "done"
    });
  }
}

export class ReportBug extends SlashCommand implements BotCommand {
  private allowedRoles = [roleIds.dev, roleIds.founder];
  constructor(bot: Client) {
    super("reportbug", bot, {
      description: "Report a bug from the 2.0 test evt",
      roles: [],
      aliases: ["rb"],
      options: [
        {
          name: "title",
          description: "Describe the bug very short",
          required: true,
          type: 3,
        },
        {
          name: "description",
          description: "Describe the bug as good as possible",
          required: true,
          type: 3,
        },
        {
          name: "footage",
          description: "The filename of a clip, The timestamp of your session video or the direct link to the clip",
          required: false,
          type: 3,
        },
      ]
    });
  }

  async handleCmd(interaction: CommandInteraction) {
    if (!interaction.member) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channelId !== BETA_TEST.channel) {
      interaction.reply({
        content: "This ain't the right channel buddy",
        ephemeral: true,
      });
      return;
    }

    const roleManager = interaction.member.roles as GuildMemberRoleManager;
    if (!roleManager.cache.some(plyRole => !!this.allowedRoles.find(roleId => roleId === plyRole.id)) && !BETA_TEST.participants.includes(interaction.user.id)) {
      interaction.reply({
        content: "You don't have the required role to run this command",
        ephemeral: true,
      });
      return false;
    }

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const footage = interaction.options.getString("footage");

    try {
      const res = await axios.post(`https://api.trello.com/1/cards?idList=${BETA_TEST.trelloListId}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`, {}, {
        params: {
          name: title,
          desc: (footage && footage.trim() !== "") ? `${description}\nfootage info: ${footage}` : description,
        },
        headers: {
          "Accept": "application/json"
        }
      });

      interaction.reply({
        content: `Bug reported, You can find it here: ${res.data.url}. Thanks!`,
        ephemeral: true,
      });
    } catch (e) {
      console.error(e);
      interaction.reply({
        content: "failed to upload new card :/",
        embeds: [{
          description: "Deze info dump is voor de devs :)",
          fields: [
            {
              name: "title",
              value: title,
            },
            {
              name: "description",
              value: description
            },
            {
              name: "footage",
              value: footage
            },
          ]
        }]
      });
    }
  }
}
