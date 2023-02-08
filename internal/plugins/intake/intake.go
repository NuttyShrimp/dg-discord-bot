package intake

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/bot/session"
	"degrens/bot/internal/config"
	"degrens/bot/internal/db"
	"degrens/bot/internal/db/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	confUitlegChan          = config.RegisterOption("CHANNELS_UITLEG", nil)
	confIntakeRecvChan      = config.RegisterOption("CHANNELS_INTAKE_RECV", nil)
	confIntakeLogChan       = config.RegisterOption("CHANNELS_INTAKE_LOGS", nil)
	confIntakeActionLogChan = config.RegisterOption("CHANNELS_INTAKE_ACTION_LOG", nil)
)

type Plugin struct {
}

func (p *Plugin) PluginInfo() *plugin.PluginInfo {
	return &plugin.PluginInfo{
		Name: "Intake",
	}
}

func RegisterPlugin() {
	p := &Plugin{}
	plugin.RegisterPlugin(p)
}

func (p *Plugin) BotInit() {
	intakeMsg := &models.IntakeMessage{}
	err := db.DB.First(intakeMsg).Error
	if err == gorm.ErrRecordNotFound {
		sendUitlegMsg()
		return
	}
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch intake message from DB")
		sendUitlegMsg()
		return
	}
	_, err = session.BotSession.ChannelMessage(confUitlegChan.GetString(), intakeMsg.MessageId)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch intake message from discord")
		sendUitlegMsg()
		return
	}
}
