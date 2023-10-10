package roles

import "degrens/bot/internal/config"

type Role string

var (
	BurgerRole         Role = "burger"
	IntakerRole        Role = "intaker"
	IntakerTraineeRole Role = "intaker-trainee"
	DevRole            Role = "dev"
	StaffRole          Role = "staff"
)

var (
	confBurgerRole        = config.RegisterOption("ROLES_BURGER", nil)
	confDevRole           = config.RegisterOption("ROLES_DEVELOPER", nil)
	confStaffRole         = config.RegisterOption("ROLES_STAFF", nil)
	confIntakeVoiceRole   = config.RegisterOption("ROLES_INTAKE_VOICE", nil)
	confIntakeRole        = config.RegisterOption("ROLES_INTAKER", nil)
	confIntakeTraineeRole = config.RegisterOption("ROLES_INTAKER_TRAINEE", nil)
	confBezoekerRole	  = config.RegisterOption("ROLES_BEZOEKER", nil)
)

func GetIdForRole(role Role) string {
	switch role {
	case "burger":
		return confBurgerRole.GetString()
	case "dev":
		return confDevRole.GetString()
	case "staff":
		return confStaffRole.GetString()
	case "intake-voice":
		return confIntakeVoiceRole.GetString()
	case "intaker":
		return confIntakeRole.GetString()
	case "intaker-trainee":
		return confIntakeTraineeRole.GetString()
	case "bezoeker":
		return confBezoekerRole.GetString()
	}
	return ""
}
