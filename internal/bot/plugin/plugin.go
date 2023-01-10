package plugin

import (
	"sync"

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

func RegisterPlugin(plugin Plugin) {
	Plugins = append(Plugins, plugin)
	log.Info("Registered plugin: " + plugin.PluginInfo().Name)
}
