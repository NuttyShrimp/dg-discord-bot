package models

type IntakeForm struct {
	ID        uint `gorm:"primaryKey;autoIncrement"`
	UserId    string
	Leeftijd  string
	RdmVdm    string
	CharName  string
	CharBG    string
	RPExp     string
	BannedExp string
	MicInfo   string
	CharBreak string
}
