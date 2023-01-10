package main

import (
	common "degrens/bot/internal"
	"degrens/bot/internal/plugins/commands"
)

func main() {
	common.Init()

	// Init all plugins
	commands.RegisterPlugin()

	common.Run()
}
