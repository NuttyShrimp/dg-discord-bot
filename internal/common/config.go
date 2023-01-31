package common

import (
	"degrens/bot/internal/config"
	"errors"
	"fmt"
)

var (
	ConfBotToken = config.RegisterOption("BOT_TOKEN", nil)
	ConfAppId    = config.RegisterOption("APPLICATION_ID", nil)
	ConfGuildId  = config.RegisterOption("GUILD_ID", nil)
	DGColor      = 0xE85476
)

var configLoaded = false

func LoadConfig() error {
	if configLoaded {
		return nil
	}

	configLoaded = true

	err := config.Load()
	if err != nil {
		return err
	}

	requiredConf := []*config.ConfigOption{
		ConfAppId,
		ConfBotToken,
		ConfGuildId,
	}

	for _, confVal := range requiredConf {
		if confVal.LoadedValue == nil {
			return errors.New(fmt.Sprintf("Did not set required config option: %s", confVal.Name))
		}
	}

	return nil
}
