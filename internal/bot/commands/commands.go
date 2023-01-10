package commands

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/bot/session"
	"degrens/bot/internal/common"
	internal "degrens/bot/internal/common"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

var commandSystem = CommandSystem{
	commands:   make(map[string]*Command),
	commandIds: []string{},
}

type CommandSystem struct {
	commands   map[string]*Command
	commandIds []string
}

type Command struct {
	Name        string
	Description string
	Options     []*discordgo.ApplicationCommandOption
	Type        discordgo.ApplicationCommandType
	Handler     func(s *discordgo.Session, i *discordgo.InteractionCreate)
	SubCommands CommandSystem
	// List of allowed roles for cmd, if empty everyone can use
	Roles []string
	// Whitelist specific users for cmds
	Users []string
}

func InitCommands() {
	for _, v := range plugin.Plugins {
		if adder, ok := v.(plugin.CommandProvider); ok {
			adder.AddCommands()
		}
	}

	session.BotSession.AddHandler(commandSystem.handleInteraction)
	for _, v := range commandSystem.commands {
		cmd, err := session.BotSession.ApplicationCommandCreate(session.BotSession.State.User.ID, common.ConfGuildId.GetString(), &discordgo.ApplicationCommand{
			Name:        v.Name,
			Type:        v.Type,
			Description: v.Description,
			Options:     v.Options,
		})
		if err != nil {
			logrus.WithError(err).Panicf("Cannot create '%v' command", v.Name)
		}
		commandSystem.commandIds = append(commandSystem.commandIds, cmd.ID)
	}
}

func DeinitCommands() {
	if commandSystem.commandIds == nil {
		return
	}
	for _, id := range commandSystem.commandIds {
		err := session.BotSession.ApplicationCommandDelete(session.BotSession.State.User.ID, internal.ConfGuildId.GetString(), id)
		if err != nil {
			logrus.WithError(err).Panicf("Cannot delete '%v' commandv", id)
		}
	}
}

func (cmdSys *CommandSystem) Get(name string) *Command {
	cmd, ok := cmdSys.commands[name]
	if !ok {
		return nil
	}
	return cmd
}

func (cmdSys *CommandSystem) GetSubCmd(cmd *Command, opt *discordgo.ApplicationCommandInteractionDataOption) (*Command, *discordgo.ApplicationCommandInteractionDataOption) {
	if cmd == nil {
		return nil, nil
	}
	subcommand := cmd.SubCommands.Get(opt.Name)
	switch opt.Type {
	case discordgo.ApplicationCommandOptionSubCommand:
		return subcommand, opt
	case discordgo.ApplicationCommandOptionSubCommandGroup:
		return cmdSys.GetSubCmd(subcommand, opt.Options[0])
	}

	return cmd, nil
}

func (cmdSys *CommandSystem) RegisterCommand(cmd *Command) {
	cmdSys.commands[cmd.Name] = cmd
}

func (cmdSys *CommandSystem) handleInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionApplicationCommand {
		return
	}
	if i.Member.User.Bot {
		return
	}
	data := i.ApplicationCommandData()
	cmd := cmdSys.Get(data.Name)
	var parent *discordgo.ApplicationCommandInteractionDataOption
	if len(data.Options) != 0 {
		cmd, parent = cmd.SubCommands.GetSubCmd(cmd, data.Options[0])
	}
	if parent != nil {
		i.Data.(discordgo.ApplicationCommandInteractionData).Options[0] = parent
	}
	cmd.Handler(s, i)
}

func RegisterCommand(cmd *Command) {
	commandSystem.commands[cmd.Name] = cmd
}

func RegisterCommands(cmds []*Command) {
	for _, c := range cmds {
		commandSystem.RegisterCommand(c)
	}
}
