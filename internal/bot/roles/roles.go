package roles

import "degrens/bot/internal/config"

type Role string

var (
	BurgerRole Role = "burger"
	DevRole    Role = "dev"
	StaffRole  Role = "staff"
)

var (
	confBurgerRole = config.RegisterOption("ROLES_BURGER", nil)
	confDevRole    = config.RegisterOption("ROLES_DEVELOPER", nil)
	confStaffRole  = config.RegisterOption("ROLES_STAFF", nil)
)

func GetIdForRole(role Role) string {
	switch role {
	case "burger":
		return confBurgerRole.GetString()
	case "dev":
		return confDevRole.GetString()
	case "staff":
		return confStaffRole.GetString()
	}
	return ""
}
