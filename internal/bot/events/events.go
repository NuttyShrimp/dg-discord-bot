package events

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/bot/session"

	"github.com/bwmarrin/discordgo"
)

func InitEventSystem() {
	session.BotSession.AddHandler(func(s *discordgo.Session, i *discordgo.MessageCreate) {
		if i.Author.Bot {
			return
		}
		for _, v := range plugin.Plugins {
			if handler, ok := v.(plugin.BotMessageHandler); ok {
				handler.MsgHandler(s, i)
			}
		}
	})
	session.BotSession.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if i.Member.User.Bot {
			return
		}
		for _, v := range plugin.Plugins {
			if handler, ok := v.(plugin.BotInteractionHandler); ok {
				handler.InteractionHandler(s, i)
			}
		}
	})
}
