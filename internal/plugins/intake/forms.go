package intake

import (
	"degrens/bot/internal/common"
	"degrens/bot/internal/db"
	"degrens/bot/internal/db/models"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

func generateIntakeFields(form *models.IntakeForm) []*discordgo.MessageEmbedField {
	return []*discordgo.MessageEmbedField{
		{
			Name:  "Leeftijd",
			Value: form.Leeftijd,
		},
		{
			Name:  "RDM/VDM",
			Value: form.RdmVdm,
		},
		{
			Name:  "Karakter naam",
			Value: form.CharName,
		},
		{
			Name:  "Karakter info + backstory",
			Value: form.CharBG,
		},
		{
			Name:  "RP Ervaring",
			Value: form.RPExp,
		},
		{
			Name:  "Ooit gebanned?",
			Value: form.BannedExp,
		},
		{
			Name:  "Mic informatie",
			Value: form.MicInfo,
		},
		{
			Name:  "In welk situatie kan je uit karakter gaan",
			Value: form.CharBreak,
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

	err := SendDM(s, i.Member.User.ID, "Hey, dit is een test om te zien of we jou kunnen dmen. Veel geluk met je intake ;)")
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

	// TODO: split in 2 modals
	err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: "intake-form-p1",
			Title:    "Intake formulier",
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:  "leeftijd",
							Label:     "IRL Leeftijd",
							Style:     discordgo.TextInputShort,
							MinLength: 2,
							MaxLength: 3,
							Required:  true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "rdm-vdm",
							Label:    "Wat is RDM/VDM",
							Style:    discordgo.TextInputParagraph,
							Required: true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "char-name",
							Label:    "Naam van je karakter",
							Style:    discordgo.TextInputShort,
							Required: true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:  "char-bg",
							Label:     "Beschrijf je karakter + geef een backstory",
							Style:     discordgo.TextInputParagraph,
							MinLength: 100,
							Required:  true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "rp-exp",
							Label:    "Voorgaande ervaring met RP",
							Style:    discordgo.TextInputParagraph,
							Required: false,
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

func openIntakeformP2(s *discordgo.Session, i *discordgo.InteractionCreate) {
	form := models.IntakeForm{}
	err := db.DB.Where("user_id = ?", i.Member.User.ID).First(&form).Error
	if err != nil {
		err := SendDMEmbed(s, i.Member.User.ID, &discordgo.MessageEmbed{
			Title:       "Er is een fout opgetreden",
			Description: "Het ziet er naar uit dat we jouw intake niet konden ophalen.\nDoor discord hun popup systeem kan ik maar een deel van antwoorden terug geven",
			Fields:      generateIntakeFields(&form),
		})
		if err != nil {
			logrus.WithError(err).WithField("form", form).Warnf("Failed to send a embed to %s with a intake form", form.UserId)
		}
		return
	}

	if form.MicInfo != "" {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Je hebt je intake al ingediend",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}

	err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: "intake-form-p2",
			Title:    "Intake formulier",
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "banned-exp",
							Label:    "Ben je ooit gebanned geweest? zoja... Waarom?",
							Style:    discordgo.TextInputShort,
							Required: false,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "mic-info",
							Label:    "Welke type microfoon heb je?",
							Style:    discordgo.TextInputShort,
							Required: true,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID: "char-break",
							Label:    "In welk situatie kan je uit karakter gaan?",
							Style:    discordgo.TextInputParagraph,
							Required: true,
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
	form := models.IntakeForm{
		UserId:   i.Member.User.ID,
		Leeftijd: data.Components[0].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value,
		RdmVdm:   data.Components[1].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value,
		CharName: data.Components[2].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value,
		CharBG:   data.Components[3].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value,
		RPExp:    data.Components[4].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value,
	}
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
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Het eerste deel is ingediend, gebruik de knop hieronder om het laatste deel in te dienen",
			Flags:   discordgo.MessageFlagsEphemeral,
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.Button{
							Label:    "Start deel 2",
							CustomID: "open-intake-form-p2",
						},
					},
				},
			},
		},
	})
}

func finaliseForm(s *discordgo.Session, i *discordgo.InteractionCreate) {
	data := i.ModalSubmitData()
	form := models.IntakeForm{}
	err := db.DB.Where("user_id = ?", i.Member.User.ID).First(&form).Error
	if err != nil {
		err := SendDMEmbed(s, i.Member.User.ID, &discordgo.MessageEmbed{
			Title:       "Er is een fout opgetreden",
			Description: "Het ziet er naar uit dat we jouw intake niet konden ophalen.\nDoor discord hun popup systeem kan ik maar een deel van antwoorden terug geven",
			Fields:      generateIntakeFields(&form),
		})
		if err != nil {
			logrus.WithError(err).WithField("form", form).Warnf("Failed to send a embed to %s with a intake form", form.UserId)
		}
		return
	}

	form.BannedExp = data.Components[0].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	form.MicInfo = data.Components[1].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	form.CharBreak = data.Components[2].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value

	err = db.DB.Save(&form).Error
	if err != nil {
		err := SendDMEmbed(s, i.Member.User.ID, &discordgo.MessageEmbed{
			Title:       "Er is een fout opgetreden",
			Description: "Het ziet er naar uit dat we jouw intake niet konden ophalen.\nHierond vind je je antwoorden terug die je gebruikt hebt",
			Fields:      generateIntakeFields(&form),
		})
		if err != nil {
			logrus.WithError(err).WithField("form", form).Warnf("Failed to send a embed to %s with a intake form", form.UserId)
		}
		return
	}

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
					discordgo.Button{
						Label:    "Decline",
						Style:    discordgo.DangerButton,
						CustomID: fmt.Sprintf("intake-revoke-%d", form.ID),
					},
				},
			},
		},
	})

	SendDMEmbed(s, i.Member.User.ID, &discordgo.MessageEmbed{
		Title:       "Intake informatie",
		Description: "Je intake is succesvol ingediend. Hieronder vind je een kopie van je antwoorden",
		Fields:      generateIntakeFields(&form),
	})

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Intake successvol ingediend",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}

func acceptIntake(s *discordgo.Session, i *discordgo.InteractionCreate) {
	idStr := strings.TrimPrefix(i.MessageComponentData().CustomID, "intake-accept-")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Kon de intake niet ophalen",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		logrus.WithError(err).Errorf("Failed to extract intake id from %s", idStr)
		return
	}
	form := models.IntakeForm{}
	err = db.DB.First(&form, uint(id)).Error
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Deze intake bestaat niet meer!",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}
	var intakeEmbed = generateIntakeEmbed(s, &form, 0x219130)
	intakeEmbed.Footer = &discordgo.MessageEmbedFooter{
		Text: fmt.Sprintf("Goedgekeurd door <@%s>", i.Member.User.ID),
	}
	s.ChannelMessageEditComplex(&discordgo.MessageEdit{
		Channel:    i.ChannelID,
		ID:         i.Message.ID,
		Embeds:     []*discordgo.MessageEmbed{intakeEmbed},
		Components: []discordgo.MessageComponent{},
	})
	s.ChannelMessageSendEmbed(confIntakeLogChan.GetString(), &discordgo.MessageEmbed{
		Title:       "Intake goedgekeurd",
		Description: fmt.Sprintf("<@%s>(%s) heeft <@%s>(%s) zijn intake goedgekeurd", i.Member.User.ID, i.Member.User.ID, form.UserId, form.UserId),
		Color:       0x219130,
		Fields:      generateIntakeFields(&form),
		Timestamp:   time.Now().Format(time.RFC3339),
	})
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
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Succesvol goedgekeurd",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}

func revokeIntake(s *discordgo.Session, i *discordgo.InteractionCreate) {
	idStr := strings.TrimPrefix(i.MessageComponentData().CustomID, "intake-revoke-")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Kon de intake niet ophalen",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		logrus.WithError(err).Errorf("Failed to extract intake id from %s", idStr)
		return
	}
	form := models.IntakeForm{}
	err = db.DB.First(&form, uint(id)).Error
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Deze intake bestaat niet meer!",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}
	intakeEmbed := generateIntakeEmbed(s, &form, 0xff0000)
	intakeEmbed.Footer = &discordgo.MessageEmbedFooter{
		Text: fmt.Sprintf("Afgekeurd door <@%s>", i.Member.User.ID),
	}
	s.ChannelMessageEditComplex(&discordgo.MessageEdit{
		Channel:    i.ChannelID,
		ID:         i.Message.ID,
		Embeds:     []*discordgo.MessageEmbed{intakeEmbed},
		Components: []discordgo.MessageComponent{},
	})
	s.ChannelMessageSendEmbed(confIntakeLogChan.GetString(), &discordgo.MessageEmbed{
		Title:       "Intake afgekeurd",
		Description: fmt.Sprintf("<@%s>(%s) heeft <@%s>(%s) zijn intake afgekeurd", i.Member.User.ID, i.Member.User.ID, form.UserId, form.UserId),
		Color:       0xff0000,
		Fields:      generateIntakeFields(&form),
		Timestamp:   time.Now().Format(time.RFC3339),
	})
	SendDMEmbed(s, form.UserId, &discordgo.MessageEmbed{
		Title:       "Intake informatie",
		Description: "Oh no, het ziet er naar uit dat je intake afgekeurd is. Probeer het nog eens als je er klaar voor bent",
	})
	db.DB.Delete(&form)
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Succesvol afgekeurd",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}
