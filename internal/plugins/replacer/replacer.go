package replacer

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/config"
	"strings"

	"github.com/aidenwallis/go-utils/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

var (
	confBugSendChan    = config.RegisterOption("CHANNELS_BUG_SEND", nil)
	confBugRecvChan    = config.RegisterOption("CHANNELS_BUG_RECV", nil)
	confSuggestionChan = config.RegisterOption("CHANNELS_SUGGESTION", nil)
)

type Plugin struct {
}

func (p *Plugin) PluginInfo() *plugin.PluginInfo {
	return &plugin.PluginInfo{
		Name: "Msg-replacer",
	}
}

func RegisterPlugin() {
	p := &Plugin{}
	plugin.RegisterPlugin(p)
}

func handleBugMsg(s *discordgo.Session, i *discordgo.MessageCreate) {
	respEmbed := &discordgo.MessageEmbed{
		Author: &discordgo.MessageEmbedAuthor{
			Name: i.Author.String(),
			URL:  i.Author.AvatarURL(""),
		},
		Title:       "Bug Report",
		Description: i.Message.Content,
		Fields:      []*discordgo.MessageEmbedField{},
	}

	if len(i.Message.Attachments) > 0 {
		respEmbed.Fields = append(respEmbed.Fields,
			&discordgo.MessageEmbedField{
				Name: "Attachments",
				Value: strings.Join(utils.SliceMap(i.Message.Attachments, func(v *discordgo.MessageAttachment) string {
					return v.ProxyURL
				}), "\n"),
			},
		)
	}

	_, err := s.ChannelMessageSendComplex(confBugRecvChan.GetString(), &discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{
			respEmbed,
		},
	})
	if err != nil {
		logrus.WithError(err).Error("Failed to send bug report")
		return
	}
	s.ChannelMessageDelete(i.ChannelID, i.Message.ID)
}
