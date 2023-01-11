package intake

import (
	"degrens/bot/internal/common"
	"degrens/bot/internal/db"
	"degrens/bot/internal/db/models"
	"fmt"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

func generateIntakeFields(form *models.IntakeForm) []*discordgo.MessageEmbedField {
	return []*discordgo.MessageEmbedField{
		{
			Name:  "Karakter naam",
			Value: form.CharBG,
		},
		{
			Name:  "Karakter achtergrond",
			Value: form.UserId,
		},
	}
}

func generateIntakeEmbed(s *discordgo.Session, form *models.IntakeForm, color int) *discordgo.MessageEmbed {
	user, err := s.User(form.UserId)
	author := &discordgo.MessageEmbedAuthor{}
	if err == nil {
		author.Name = user.String()
		author.IconURL = user.AvatarURL("")
	}
	return &discordgo.MessageEmbed{
		Title:  fmt.Sprintf("Nieuwe intake (#%d)", form.ID),
		Author: author,
		Color:  color,
		Fields: generateIntakeFields(form),
	}
}

func openIntakeForm(s *discordgo.Session, i *discordgo.InteractionCreate) {
	// Check if user already has submitted a form
	var count int64
	db.DB.Model(&models.IntakeForm{}).Where("user_id = ?", i.Member.User.ID).Count(&count)
	if count != 0 {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Je hebt je intake al ingediend",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}

	err := SendDM(s, i.Member.User.ID, "Hey, dit is juist een test om te zien of we jou kunnen dmen. Veel geluk met je intake ;)")
	if err != nil {
		logrus.WithError(err).Warnf("Failed to send a DM to %s", i.Member.User.ID)
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Kon geen bericht sturen in je dm's, Gelieve deze open te zetten voor het intake process te starten.",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
	}

	err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: "intake-form",
			Title:    "Intake formulier",
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:  "char-name",
							Label:     "Naam van je karakter",
							Style:     discordgo.TextInputShort,
							MinLength: 1,
							Required:  true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:  "char-bg",
							Label:     "Achtergrond informatie over je karakter",
							Style:     discordgo.TextInputParagraph,
							MinLength: 100,
							Required:  true,
						},
					},
				},
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Info("Failed to open the intake formulier modal")
	}
}

func saveForm(s *discordgo.Session, i *discordgo.InteractionCreate) {
	data := i.ModalSubmitData()
	fmt.Println(i.Member.User.ID)
	form := models.IntakeForm{
		UserId: i.Member.User.ID,
	}
	form.CharName = data.Components[0].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	form.CharBG = data.Components[1].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	err := db.DB.Create(&form).Error
	if err != nil {
		err := SendDMEmbed(s, i.Member.User.ID, &discordgo.MessageEmbed{
			Title:       "Er is een fout opgetreden",
			Description: "Het ziet er naar uit dat we jouw intake niet konde opslagen.\nHieronder vind je je antwoorden zodat je niet alles verliest",
			Fields:      generateIntakeFields(&form),
		})
		if err != nil {
			logrus.WithError(err).WithField("form", form).Warnf("Failed to send a embed to %s with a intake form", form.UserId)
		}
		return
	}
	// TODO: Send new intake in intake_recv channel
	s.ChannelMessageSendComplex(confIntakeRecvChan.GetString(), &discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			generateIntakeEmbed(s, &form, 0xb15324),
		},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "Accept",
						Style:    discordgo.SuccessButton,
						CustomID: fmt.Sprintf("intake-accept-%d", form.ID),
					},
				},
			},
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "Decline",
						Style:    discordgo.DangerButton,
						CustomID: fmt.Sprintf("intake-revoke-%d", form.ID),
					},
				},
			},
		},
	})

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Intake successvol ingediend",
		},
	})
}

func acceptIntake(s *discordgo.Session, i *discordgo.InteractionCreate) {
	id := strings.TrimPrefix(i.MessageComponentData().CustomID, "intake-accept-")
	form := models.IntakeForm{}
	err := db.DB.First(form, id).Error
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Deze intake bestaat niet meer!",
			},
		})
		return
	}
	s.ChannelMessageEditEmbed(i.ChannelID, i.Message.ID, generateIntakeEmbed(s, &form, 0x219130))
	s.GuildMemberRoleAdd(common.ConfGuildId.GetString(), form.UserId, confIntakeVoiceRole.GetString())
	SendDMEmbed(s, form.UserId, &discordgo.MessageEmbed{
		Title:       "Intake informatie",
		Description: "Proficiat je bent door de eerste rond van intakes geraakt. De 2de en laatste ronde staat hieronder weer beschreven",
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:  "Stap 1",
				Value: "Wacht, niet zo moeilijk he. Je kunt een nieuwe kanaal zien, hierin zullen intakers plaatsen wanneer ze mondelinge intakes doen",
			},
			{
				Name:  "Stap 2",
				Value: "Hoera er is een mondelinge intake sessie aangekondigd. De intakers zullen iets op voorhand de wachtkamer openzetten waar je kunt gaan inzitten als je klaar bent voor je mondelinge intake",
			},
			{
				Name:  "Stap 3",
				Value: "Ga het gesprek aan, Je zult ondervraagt worden over o.a. de regels maar ze zullen ook testen of je volgens hun wel schikt bent om te roleplayen",
			},
		},
	})
	db.DB.Delete(&form)
}

func revokeIntake(s *discordgo.Session, i *discordgo.InteractionCreate) {
	id := strings.TrimPrefix(i.MessageComponentData().CustomID, "intake-revoke-")
	form := models.IntakeForm{}
	err := db.DB.First(form, id).Error
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Deze intake bestaat niet meer!",
			},
		})
		return
	}
	s.ChannelMessageEditEmbed(i.ChannelID, i.Message.ID, generateIntakeEmbed(s, &form, 0xff0000))
	SendDMEmbed(s, form.UserId, &discordgo.MessageEmbed{
		Title:       "Intake informatie",
		Description: "Oh no, het ziet er naar uit dat je intake afgekeurd is. Probeer het nog eens als je er klaar voor bent",
	})
	db.DB.Delete(&form)
}
