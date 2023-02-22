package cfx

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/bot/session"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

var (
	quitInterval chan bool
)

type Plugin struct {
}

func (p *Plugin) PluginInfo() *plugin.PluginInfo {
	return &plugin.PluginInfo{
		Name: "server-info",
	}
}

func RegisterPlugin() {
	p := &Plugin{}
	plugin.RegisterPlugin(p)
}

func FetchPlayerCount() {
	logrus.Info("Fetching player count")
	resp, err := http.Get("http://play.degrensrp.be:30120/info.json")
	if err != nil || resp.StatusCode >= 400 {
		session.BotSession.UpdateStatusComplex(discordgo.UpdateStatusData{
			Status: "dnd",
			Activities: []*discordgo.Activity{
				{
					Name: "Offline",
					Type: discordgo.ActivityTypeWatching,
				},
			},
		})
		return
	}
	bodyStr, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logrus.WithError(err).Error("failed to read body of info")
		return
	}
	info := &ServerInfo{}
	err = json.Unmarshal(bodyStr, info)
	if err != nil {
		logrus.WithError(err).Error("failed to deserialize info object")
		return
	}
	if info.Vars.Queue == "" {
		info.Vars.Queue = "0"
	}
	if info.Vars.Connected == "" {
		info.Vars.Connected = "0"
	}
	session.BotSession.UpdateStatusComplex(discordgo.UpdateStatusData{
		Status: "online",
		Activities: []*discordgo.Activity{
			{
				Name: fmt.Sprintf("%s(%s) spelers", info.Vars.Connected, info.Vars.Queue),
				Type: discordgo.ActivityTypeWatching,
			},
		},
	})
}

func (p *Plugin) BotInit() {
	FetchPlayerCount()
	fetchInterval := time.NewTicker(20000 * time.Second)
	quitInterval = make(chan bool)
	go func() {
		for {
			select {
			case <-quitInterval:
				fetchInterval.Stop()
				return
			case <-fetchInterval.C:
				FetchPlayerCount()
			}
		}
	}()
}

func (p *Plugin) StopBot(wg *sync.WaitGroup) {
	if quitInterval != nil {
		quitInterval <- true
	}
	wg.Done()
}
