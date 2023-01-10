package run

import (
	"degrens/bot/internal/bot"
	"os"
	"os/signal"
	"sync"
	"syscall"

	log "github.com/sirupsen/logrus"
)

func ListenSignal() {
	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	<-c
	shutdown()
}

func shutdown() {
	log.Info("SHUTTING DOWN... ")

	wg := new(sync.WaitGroup)
	wg.Add(1)
	go bot.Stop(wg)

	log.Info("Waiting for things to shut down...")
	wg.Wait()

	os.Exit(0)
}
