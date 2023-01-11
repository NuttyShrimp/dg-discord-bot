package models

type IntakeForm struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	UserId   string
	CharName string
	CharBG   string
}
