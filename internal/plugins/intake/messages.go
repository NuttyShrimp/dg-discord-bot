package intake

import (
	"degrens/bot/internal/bot/session"
	"degrens/bot/internal/common"
	"degrens/bot/internal/db"
	"degrens/bot/internal/db/models"
	"errors"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

func sendUitlegMsg() {
	msg, err := session.BotSession.ChannelMessageSendComplex(confUitlegChan.GetString(), &discordgo.MessageSend{
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						CustomID: "open-intake-form",
						Label:    "Open Intake form",
						Style:    discordgo.PrimaryButton,
					},
				},
			},
		},
		Embeds: []*discordgo.MessageEmbed{
			{
				Title: "DeGrensRP Intake",
				Color: common.DGColor,
				Fields: []*discordgo.MessageEmbedField{
					{
						Name:  "Welkom",
						Value: "Welkom op DeGrensRP, Wij zijn een van de grootste GTA RP communities in Belgie\nOm onze server te kunnen spelen moet je eerst door ons intake process gaan.",
					},
					{
						Name: "Intake",
						Value: `Voordat je begint aan het intake process moet je eerst je DM's hebben open staan voor deze server. Anders zal het process automatisch falen.
            Het intake process bestaat uit 2 delen. Je begint met je karakter schriftelijk voor te stellen, zie hieronder hoe je dit moet doen. Onze intakers zullen deze karakters beoordelen en op basis hiervan zal je kunnen doorgaan naar het 2de deel. Het 2de deel bestaat uit een mondeling gesprek met onze lieftallige intakers. Als dit gesprek goedverloopt zal je je burger role toegewezen krijgen waarmee je toegang krijgt tot de server!
            `,
					},
					{
						Name:  "Stap 1",
						Value: "Neem alle regels op [onze wiki](https://wiki.degrensrp.be/nl/regels) **Grondig** door. Zorg ook dat je elke regel begrijpt en in eigen woorden kan uitleggen.",
					},
					{
						Name:  "Stap 2",
						Value: "Neem even de tijd om een uniek karakter te bedenken. Denk hierbij ook aan welke eigenschappen je karakter zou hebben",
					},
					{
						Name:  "Stap 3",
						Value: "Vul het intake formulier in. Dit kun je door op de knop onder dit bericht te drukken, **LET OP** Het formulier bestaat uit 2 delen, nadat je het eerste deel ingediend hebt zul je een bericht krijgen met de knop om het 2de formulier te openen",
					},
					{
						Name:  "Stap 4",
						Value: "Onze intakers zullen je intake bekijken wanneer zij hier tijd voor hebben. Je zult een **DM** ontvangen met hierin vermeld of je al dan niet door de 1ste ronde bent. Als je erdoor bent zul je in hetzelfde bericht de verdere stappen zien.",
					},
				},
			},
		},
	},
	)
	if err != nil {
		logrus.WithError(err).Error("Failed to send intake msg")
	}
	db.DB.Exec("DELETE FROM intake_messages")
	intakeMsg := &models.IntakeMessage{
		MessageId: msg.ID,
	}
	db.DB.Create(intakeMsg)
}

func SendDMEmbed(s *discordgo.Session, UserId string, content *discordgo.MessageEmbed) error {
	dmChan, err := s.UserChannelCreate(UserId)
	if err != nil {
		return errors.New("Failed to open DM Channel")
	}
	_, err = s.ChannelMessageSendEmbed(dmChan.ID, content)
	if err != nil {
		return errors.New("Failed to send DM message")
	}
	return nil
}

func SendDM(s *discordgo.Session, UserId, content string) error {
	dmChan, err := s.UserChannelCreate(UserId)
	if err != nil {
		return errors.New("Failed to open DM Channel")
	}
	_, err = s.ChannelMessageSend(dmChan.ID, content)
	if err != nil {
		return errors.New("Failed to send DM message")
	}
	return nil
}
