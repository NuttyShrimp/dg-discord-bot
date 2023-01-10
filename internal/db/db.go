package db

import (
	"degrens/bot/internal/config"
	"degrens/bot/internal/db/models"
	"fmt"

	gorm_logrus "github.com/onrik/gorm-logrus"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	DB             *gorm.DB
	confDBHost     = config.RegisterOption("MARIADB_HOST", nil)
	confDBPort     = config.RegisterOption("MARIADB_PORT", 3306)
	confDBUser     = config.RegisterOption("MARIADB_USER", nil)
	confDBPassword = config.RegisterOption("MARIADB_PASSWORD", nil)
	confDBDatabase = config.RegisterOption("MARIADB_DATABASE", "dg-bot")
)

func NewDb() (err error) {
	connStr := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local", confDBUser.GetString(), confDBPassword.GetString(), confDBHost.GetString(), confDBPort.GetInt(), confDBDatabase.GetString())
	DB, err = gorm.Open(mysql.Open(connStr), &gorm.Config{
		Logger: gorm_logrus.New(),
	})
	if err != nil {
		return err
	}
	DB.AutoMigrate(&models.StickyMessage{})
	return nil
}
