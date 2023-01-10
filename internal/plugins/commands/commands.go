package commands

import (
	"degrens/bot/internal/bot/commands"
	"degrens/bot/internal/bot/plugin"

	"github.com/bwmarrin/discordgo"
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
		Handler: func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "Druk F8 in FiveM --> `connect play.degrensrp.be`",
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
		},
	}
	cmds := []*commands.Command{
		&f8Cmd,
	}
	commands.RegisterCommands(cmds)
}
