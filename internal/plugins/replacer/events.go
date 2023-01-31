package replacer

import (
	"github.com/bwmarrin/discordgo"
)

func (p *Plugin) MsgHandler(s *discordgo.Session, i *discordgo.MessageCreate) {
	switch i.ChannelID {
	case confBugSendChan.GetString():
		{
			handleBugMsg(s, i)
		}
	case confSuggestionChan.GetString():
		{
			handleSuggestionMsg(s, i)
		}
	}
}
