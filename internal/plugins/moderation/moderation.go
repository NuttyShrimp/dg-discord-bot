package moderation

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/config"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

var (
	confMsgLogChannel = config.RegisterOption("CHANNELS_MSGLOG", nil)
)

type Plugin struct {
}

func (p *Plugin) PluginInfo() *plugin.PluginInfo {
	return &plugin.PluginInfo{
		Name: "Moderation",
	}
}

func RegisterPlugin() {
	p := &Plugin{}
	plugin.RegisterPlugin(p)
}

func LogMessage(s *discordgo.Session, msg *discordgo.Message) {
	s.ChannelMessageSendEmbed(confMsgLogChannel.GetString(), &discordgo.MessageEmbed{
		Color: 0xE95578,
		Author: &discordgo.MessageEmbedAuthor{
			Name:    msg.Author.String(),
			IconURL: msg.Author.AvatarURL(""),
		},
		Title:       fmt.Sprintf(`Message send in <#%s>`, msg.ChannelID),
		Description: msg.Content,
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:  "Channel",
				Value: fmt.Sprintf("<#%s>", msg.ChannelID),
			},
		},
	})
}
