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
		Name:        "addburger",
		Description: "Give a user the burger role",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionUser,
				Name:        "target",
				Description: "Wie heeft er nen goeie intake gedaan?",
				Required:    true,
			},
		},
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate, options commands.Options) error {
			if options["target"] == nil {
				return errors.New("No target given for a new burger")
			}
			target := options["target"].UserValue(s)
			s.GuildMemberRoleAdd(common.ConfGuildId.GetString(), target.ID, roles.GetIdForRole("burger"))
			err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: fmt.Sprintf("<@%s> heeft zn role ontvangen", target.ID),
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
			return err
		},
	}
	commands.RegisterCommand(addMem)
}
