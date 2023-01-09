import { ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from "@discordjs/builders";
import { APIEmbed, ButtonStyle, ChannelType } from "discord-api-types/v10";
import { BaseInteraction, CacheType, Client } from "discord.js";
import { channels, DG_COLOR } from "../constants";
import { BotModule, Module } from "../lib/classes/AbstractModule";

// TODO: Add check if player has DM's open on button click/interactionCreate

export class Intake extends Module implements BotModule {
  constructor(bot: Client) {
    super(bot);
  }

  private async getUitlegChannel() {
    const uitlegChannel = await this.bot.channels.fetch(channels.intakeInfoChannel);
    if (uitlegChannel?.type !== ChannelType.GuildText) {
      throw new Error("channels.intakeInfoChannel is not a text channel");
    }
    return uitlegChannel;
  }

  async start() {
    const uitlegChannel = await this.getUitlegChannel();
    await uitlegChannel.messages.fetch();
    const infoMessage = uitlegChannel.messages.cache.at(0);
    if (infoMessage) {
      const infoMessageSender = await infoMessage.author.fetch();
      if (infoMessageSender) {
        if (!infoMessageSender.bot || infoMessageSender.id !== this.bot.user?.id) {
          this.sendInfoMessage();
        }
      }
    } else {
      this.sendInfoMessage();
    }
  }

  private async sendInfoMessage() {
    const uitlegChannel = await this.getUitlegChannel();
    const uitlegEmbed: APIEmbed = {
      title: "DeGrensRP Intake",
      color: DG_COLOR,
      fields: [
        {
          name: "Welkom",
          value: "Welkom op DeGrensRP, Wij zijn een van de grootste GTA RP communities in Belgie",
        },
        {
          name: "Intake",
          value: `Hey leuk dat je wilt komen RPen op onze server. Voordat je begint aan het intake process dien je eerst je DM's te hebben open/aanstaan voor deze server. Anders zal het process automatisch falen.
            De intake bestaat uit 2 delen. Je begint net je karakter schriftelijk voor te stellen. Onze intakers zullen deze karakters beoordelen en op basis hiervan zul je kunnen doorgaan naar het 2de deel. Het 2de deel bestaat uit een mondeling gesprek. Na dit gesprek zal je al dan niet kunnen meespelen!
            `,
        },
        {
          name: "Stap 1",
          value: "Neem alle regels op wiki.degrensrp.be/nl/regels **Grondig** door. Zorg ook dat je elke regel begrijpt en in eigen woorden kan uitleggen.",
        },
        {
          name: "Stap 2",
          value: "Neem even de tijd om een uniek karakter te bedenken. Denk hierbij ook aan welke eigenschappen je karakter zou hebben",
        },
        {
          name: "Stap 3",
          value: "Vul het whitelist formulier in. Dit kun je door op de knop onder dit bericht te drukken",
        },
        {
          name: "Stap 4",
          value: "Onze intakers zullen nu je intake bekijken wanneer zij hier tijd voor hebben. Je zult een **DM** ontvangen met de beoordeling van je schriftelijk intake. Mocht je erdoor zijn zullen in dit bericht ook de verdere stappen vermeld worden."
        }
      ]
    };

    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("open-intake-form")
          .setLabel("Open intake form")
          .setStyle(ButtonStyle.Primary)
      );

    // @ts-ignore
    uitlegChannel.send({ embeds: [uitlegEmbed], components: [actionRow] });
  }

  async onInteraction(msg: BaseInteraction<CacheType>){
    if (msg.isButton()){
      if (msg.customId === "open-intake-form") {
        const userDM = await msg.user.createDM();
        console.log(userDM);
      }
    }
  }
}
