package moderation

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

var (
	linkList = "https://raw.githubusercontent.com/DevSpen/links/master/src/links.txt"
	links    []string
)

func msgContainsSpam(msg string) bool {
	msg = strings.ToLower(msg)
	for _, link := range links {
		if strings.Contains(msg, link) {
			fmt.Printf("%s contains %s", msg, link)
			return true
		}
	}
	return false
}

func (p *Plugin) BotInit() {
	req, err := http.Get(linkList)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch link list with scam links")
		return
	}
	defer req.Body.Close()
	linksStr, err := ioutil.ReadAll(req.Body)
	if err != nil {
		logrus.WithError(err).Error("Failed to read antispam links from body")
		return
	}
	links = strings.Split(string(linksStr), " ")
}

func (p *Plugin) MsgHandler(s *discordgo.Session, i *discordgo.MessageCreate) {
	LogMessage(s, i.Message)
	if msgContainsSpam(i.Content) {
		s.ChannelMessageDelete(i.ChannelID, i.Message.ID)
	}
}

func (p *Plugin) InteractionHandler(s *discordgo.Session, i *discordgo.InteractionCreate) {
	LogMessage(s, &discordgo.Message{
		Author:    i.Interaction.Member.User,
		ChannelID: i.ChannelID,
		Content:   i.Interaction.ApplicationCommandData().Name,
	})
}
