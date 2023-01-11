package models

type StickyMessage struct {
	ChannelId string `gorm:"primaryKey"`
	MessageId string
	Message   string
}
