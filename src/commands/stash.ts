import SlashCommand, {BotCommand} from "../lib/classes/SlashCommands";
import {ChatInputCommandInteraction, Client} from "discord.js";

export class Stash extends SlashCommand implements BotCommand {
  constructor(bot: Client) {
    super("stash", bot, {
      description: "Problemen met je stash? Check hier wat je moet doen!",
      roles: []
    });
  }

  handleCmd(interaction: ChatInputCommandInteraction) {
    if (!interaction.member) return;

    interaction.reply({
      content: `**Geef de server 1/3 seconden tijd om te loggen.**
Plaats of haal je iets in/uit je stash, wacht dan eventjes alvorens je stash te sluiten.
 
**Plaats geen items in de bovenste 2 rijen**
We merken wel eens dat dit meestal voorkomt in de bovenste 2 rijen. 
Dit kan toeval zijn omdat deze ook gewoon het meeste gebruikt worden in combinatie met je stash te snel te sluiten.
 
**Vermijd ook onnodige verplaatsingen**
Als iets in je stash zit verplaats het dan ook geen 100x op 5 minuten tijd, dit maakt het ook gewoon lastig om het achteraf na te checken.`,
      ephemeral: true
    });
  }
}
