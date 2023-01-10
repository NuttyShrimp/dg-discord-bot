package bot

import (
	"degrens/bot/internal/bot/commands"
	"degrens/bot/internal/bot/plugin"
	"sync"
)

var (
	stopOnce sync.Once
)

func stopAllPlugins(wg *sync.WaitGroup) {
	stopOnce.Do(func() {
		for _, v := range plugin.Plugins {
			stopper, ok := v.(plugin.BotStopperHandler)
			if !ok {
				continue
			}
			wg.Add(1)
			go stopper.StopBot(wg)
		}
	})
}

func Run() {
	commands.InitCommands()
	for _, p := range plugin.Plugins {
		if initBot, ok := p.(plugin.BotInitHandler); ok {
			initBot.BotInit()
		}
	}
}

func Stop(wg *sync.WaitGroup) {
	stopAllPlugins(wg)
	commands.DeinitCommands()
	wg.Done()
}
