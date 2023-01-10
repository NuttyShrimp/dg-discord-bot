package cfx

type ServerInfo struct {
	Vars struct {
		Connected int `json:"sv_queueConnectedCount"`
		Queue     int `json:"sv_queueCount"`
	} `json:"vars"`
}
