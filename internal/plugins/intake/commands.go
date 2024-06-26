package intake

import (
	"degrens/bot/internal/bot/commands"
	"degrens/bot/internal/bot/roles"
	"degrens/bot/internal/common"
	"errors"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func (p *Plugin) AddCommands() {
	addMem := &commands.Command{
		Name:        "intakeaction",
		Description: "Give a user the burger role",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionUser,
				Name:        "target",
				Description: "Wie heeft er nen goeie intake gedaan?",
				Required:    true,
			},
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "action",
				Description: "wa wilde doen",
				Required:    true,
				Choices: []*discordgo.ApplicationCommandOptionChoice{
					{
						Name:  "Accept",
						Value: "accept",
					},
					{
						Name:  "Decline",
						Value: "decline",
					},
				},
			},
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "message",
				Description: "Extra uitleg (optioneel)",
				Required:    false,
			},
		},
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate, options commands.Options) []error {
			errs := []error{}
			if options["target"] == nil {
				errs = append(errs, errors.New("No target given for a new burger"))
				return errs
			}
			if options["action"] == nil {
				errs = append(errs, errors.New("No action given for a new burger"))
				return errs
			}
			target := options["target"].UserValue(s)
			action := options["action"].StringValue()
			logEmbed := &discordgo.MessageEmbed{
				Title: fmt.Sprintf("Voice intake %s", action),
			}

			if err := s.GuildMemberRoleRemove(common.ConfGuildId.GetString(), target.ID, roles.GetIdForRole("intake-voice")); err != nil {
				errs = append(errs, err)
			}
			if err := s.GuildMemberRoleRemove(common.ConfGuildId.GetString(), target.ID, roles.GetIdForRole("bezoeker")); err != nil {
				errs = append(errs, err)
			}
			if action == "accept" {
				err := s.GuildMemberRoleAdd(common.ConfGuildId.GetString(), target.ID, roles.GetIdForRole("burger"))
				if err != nil {
					errs = append(errs, err)
					return errs
				}
				if err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
					Type: discordgo.InteractionResponseChannelMessageWithSource,
					Data: &discordgo.InteractionResponseData{
						Content: fmt.Sprintf("<@%s> heeft zijn burger role ontvangen", target.ID),
						Flags:   discordgo.MessageFlagsEphemeral,
					},
				}); err != nil {
					errs = append(errs, err)
				}
				logEmbed.Description = fmt.Sprintf("%s heeft %s toegelaten", i.Member.User.String(), target.String())
				logEmbed.Color = 0x219130
				if options["message"] != nil {
					logEmbed.Description += " opmerking: " + options["message"].StringValue()
				}
			} else {
				if options["message"] == nil {
					if err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
						Type: discordgo.InteractionResponseChannelMessageWithSource,
						Data: &discordgo.InteractionResponseData{
							Content: "Bij een decline is een message verplicht",
							Flags:   discordgo.MessageFlagsEphemeral,
						},
					}); err != nil {
						errs = append(errs, err)
					}
					return errs
				}
				if err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
					Type: discordgo.InteractionResponseChannelMessageWithSource,
					Data: &discordgo.InteractionResponseData{
						Content: fmt.Sprintf("<@%s> heeft zijn intake-voice role verloren", target.ID),
						Flags:   discordgo.MessageFlagsEphemeral,
					},
				}); err != nil {
					errs = append(errs, err)
				}
				logEmbed.Color = 0xff0000
				logEmbed.Description = fmt.Sprintf("%s heeft %s afgewezen opmerking: %s", i.Member.User.String(), target.String(), options["message"].StringValue())
			}
			if _, err := s.ChannelMessageSendEmbed(confIntakeActionLogChan.GetString(), logEmbed); err != nil {
				errs = append(errs, err)
			}
			return errs
		},
		Roles: []roles.Role{
			roles.DevRole,
			roles.IntakerRole,
			roles.IntakerTraineeRole,
			roles.StaffRole,
		},
	}
	commands.RegisterCommand(addMem)
}
