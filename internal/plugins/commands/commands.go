package commands

import (
	"degrens/bot/internal/bot/commands"
	"degrens/bot/internal/bot/plugin"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

var (
	lastWikiMsg *discordgo.Message
)

// This is just a plugin with commands with no special logic attached

type Plugin struct {
}

func (p *Plugin) PluginInfo() *plugin.PluginInfo {
	return &plugin.PluginInfo{
		Name: "Commands",
	}
}

func RegisterPlugin() {
	p := &Plugin{}
	plugin.RegisterPlugin(p)
}

func (p *Plugin) AddCommands() {
	f8Cmd := commands.Command{
		Name:        "f8",
		Description: "Check hoe je de server kunt joinen",
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate, _ commands.Options) []error {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "Druk F8 in FiveM --> `connect play.degrensrp.be`",
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
			return nil
		},
	}
	wikiCmd := commands.Command{
		Name:        "wiki",
		Description: "Maak reclame voor onze wiki!",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Name:        "target",
				Description: "Wie moet er weten over onze wiki",
				Type:        discordgo.ApplicationCommandOptionUser,
				Required:    false,
			},
		},
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate, options commands.Options) []error {
			if _, ok := options["target"]; !ok {
				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
					Type: discordgo.InteractionResponseChannelMessageWithSource,
					Data: &discordgo.InteractionResponseData{
						Content: "Ey, check uzze wiki: <https://wiki.degrensrp.be/>",
						Flags:   discordgo.MessageFlagsEphemeral,
					},
				})
				return nil
			}
			if lastWikiMsg != nil {
				s.ChannelMessageDelete(lastWikiMsg.ChannelID, lastWikiMsg.ID)
			}

			err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: fmt.Sprintf("Ey <@%s>, check uzze wiki: <https://wiki.degrensrp.be/>", options["target"].UserValue(s).ID),
				},
			})
			if err != nil {
				return []error{err}
			}
			lastWikiMsg, err = s.InteractionResponse(i.Interaction)
			return []error{}
		},
	}
	cmds := []*commands.Command{
		&f8Cmd,
		&wikiCmd,
	}
	commands.RegisterCommands(cmds)
}
