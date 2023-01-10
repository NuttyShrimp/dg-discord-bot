package plugin

import (
	"sync"

	"github.com/bwmarrin/discordgo"
	log "github.com/sirupsen/logrus"
)

var (
	Plugins []Plugin
)

type PluginInfo struct {
	Name string
}

type Plugin interface {
	PluginInfo() *PluginInfo
}

type BotStopperHandler interface {
	StopBot(wg *sync.WaitGroup)
}

type BotInitHandler interface {
	BotInit()
}

type CommandProvider interface {
	AddCommands()
}

type BotMessageHandler interface {
	MsgHandler(s *discordgo.Session, i *discordgo.MessageCreate)
}

type BotInteractionHandler interface {
	InteractionHandler(s *discordgo.Session, i *discordgo.InteractionCreate)
}

func RegisterPlugin(plugin Plugin) {
	Plugins = append(Plugins, plugin)
	log.Info("Registered plugin: " + plugin.PluginInfo().Name)
}
