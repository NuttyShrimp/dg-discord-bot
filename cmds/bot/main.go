package main

import (
	common "degrens/bot/internal"
	"degrens/bot/internal/plugins/cfx"
	"degrens/bot/internal/plugins/commands"
	"degrens/bot/internal/plugins/intake"
	"degrens/bot/internal/plugins/moderation"
	"degrens/bot/internal/plugins/replacer"
)

func main() {
	common.Init()

	// Init all plugins
	commands.RegisterPlugin()
	intake.RegisterPlugin()
	moderation.RegisterPlugin()
	replacer.RegisterPlugin()
	cfx.RegisterPlugin()

	common.Run()
}
