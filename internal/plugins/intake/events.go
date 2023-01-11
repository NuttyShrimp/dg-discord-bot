package intake

import (
	"strings"

	"github.com/bwmarrin/discordgo"
)

func (p *Plugin) InteractionHandler(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type == discordgo.InteractionMessageComponent && i.MessageComponentData().CustomID == "open-intake-form" {
		openIntakeForm(s, i)
		return
	}
	if i.Type == discordgo.InteractionMessageComponent && strings.HasPrefix(i.MessageComponentData().CustomID, "intake-accept-") {
		acceptIntake(s, i)
		return
	}
	if i.Type == discordgo.InteractionMessageComponent && strings.HasPrefix(i.MessageComponentData().CustomID, "intake-revoke-") {
		revokeIntake(s, i)
		return
	}
	if i.Type == discordgo.InteractionModalSubmit && i.ModalSubmitData().CustomID == "intake-form" {
		saveForm(s, i)
		return
	}
}
