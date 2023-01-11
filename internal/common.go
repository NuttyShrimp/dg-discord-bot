package internal

import (
	"degrens/bot/internal/bot"
	"degrens/bot/internal/bot/session"
	"degrens/bot/internal/common"
	"degrens/bot/internal/db"
	"degrens/bot/internal/run"
	"strings"

	"github.com/bwmarrin/discordgo"
	log "github.com/sirupsen/logrus"
)

func Init() {
	err := common.LoadConfig()
	if err != nil {
		log.WithError(err).Fatal("Failed to initialize Core commons")
	}

	log.Info("Starting DG discord bot")
	// TODO: add sentry hook
	if err = setupGlobalDGoSession(); err != nil {
		log.WithError(err).Fatal("Failed to create discordgo session")
	}

	db.NewDb()
}

func Run() {
	bot.Run()
	run.ListenSignal()
}

func getBotToken() string {
	token := common.ConfBotToken.GetString()
	if !strings.HasPrefix(token, "Bot ") {
		token = "Bot " + token
	}
	return token
}

func setupGlobalDGoSession() error {
	BotSession, err := discordgo.New(getBotToken())
	if err != nil {
		return err
	}

	BotSession.MaxRestRetries = 10

	BotSession.Identify.Intents = discordgo.IntentsAll

	session.SetSession(BotSession)

	BotSession.UpdateStatusComplex(discordgo.UpdateStatusData{
		Status: string(discordgo.StatusOnline),
		AFK:    false,
		Activities: []*discordgo.Activity{
			{
				Type: discordgo.ActivityTypeWatching,
				Name: "Showing test activity",
			},
		},
	})

	err = BotSession.Open()
	if err != nil {
		log.WithError(err).Info("failed to open websocket to discord")
	}

	return nil
}
