package session

import (
	"github.com/bwmarrin/discordgo"
	log "github.com/sirupsen/logrus"
)

// Because we LOVE import cycles

var (
	BotSession *discordgo.Session
)

func SetSession(ses *discordgo.Session) {
	BotSession = ses
	BotSession.AddHandler(func(s *discordgo.Session, r *discordgo.Ready) {
		log.Infof("Logged in as: %v#%v", s.State.User.Username, s.State.User.Discriminator)
	})
}
