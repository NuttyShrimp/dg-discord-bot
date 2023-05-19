package moderation

import (
	"degrens/bot/internal/bot/commands"
	"degrens/bot/internal/bot/roles"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func (p *Plugin) AddCommands() {
	minMsgFloat := float64(1.0)
	clearCmd := &commands.Command{
		Name:        "clear",
		Description: "Clear some messages",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Name:        "count",
				Description: "How many messages should we delete?",
				Type:        discordgo.ApplicationCommandOptionInteger,
				MinValue:    &minMsgFloat,
				Required:    true,
			},
		},
		Roles: []roles.Role{"staff", "developer"},
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate, options commands.Options) []error {
			num := options["count"].IntValue()
			if num > 100 {
				num = 100
			}

			msgs, err := s.ChannelMessages(i.ChannelID, int(num), "", "", "")
			if err != nil {
				return []error{err}
			}
			msgId := []string{}
			for _, msg := range msgs {
				msgId = append(msgId, msg.ID)
			}
			s.ChannelMessagesBulkDelete(i.ChannelID, msgId)
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: fmt.Sprintf("Deleted %d messages", num),
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
			return nil
		},
	}
	commands.RegisterCommand(clearCmd)
}
