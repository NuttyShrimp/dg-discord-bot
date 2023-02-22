package cfx

type ServerInfo struct {
	Vars struct {
		Connected string `json:"sv_connectedCount"`
		Queue     string `json:"sv_queueCount"`
	} `json:"vars"`
}
