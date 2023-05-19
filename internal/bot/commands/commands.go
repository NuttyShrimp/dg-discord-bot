package commands

import (
	"degrens/bot/internal/bot/plugin"
	"degrens/bot/internal/bot/roles"
	"degrens/bot/internal/bot/session"
	"degrens/bot/internal/common"
	internal "degrens/bot/internal/common"

	"github.com/aidenwallis/go-utils/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/getsentry/sentry-go"
	"github.com/sirupsen/logrus"
)

var commandSystem = CommandSystem{
	commands:   make(map[string]*Command),
	commandIds: []string{},
}

type Options map[string]*discordgo.ApplicationCommandInteractionDataOption

type CommandSystem struct {
	commands   map[string]*Command
	commandIds []string
}

type Command struct {
	Name        string
	Description string
	Options     []*discordgo.ApplicationCommandOption
	Type        discordgo.ApplicationCommandType
	Handler     func(s *discordgo.Session, i *discordgo.InteractionCreate, options Options) []error
	SubCommands *CommandSystem
	// List of allowed roles for cmd, if empty everyone can use
	Roles []roles.Role
	// Whitelist specific users for cmds
	Users []string
}

func InitCommands() {
	oldCmds, err := session.BotSession.ApplicationCommands(session.BotSession.State.User.ID, internal.ConfGuildId.GetString())
	if err != nil {
		logrus.WithError(err).Error("Failed to retrieve old commands from discord")
	} else {
		for _, oCmd := range oldCmds {
			err := session.BotSession.ApplicationCommandDelete(session.BotSession.State.User.ID, internal.ConfGuildId.GetString(), oCmd.ID)
			if err != nil {
				logrus.WithError(err).Errorf("Cannot delete '%v' commandv", oCmd.Name)
			}
		}
	}

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
	if cmd.SubCommands == nil {
		return cmd, nil
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
	if cmd == nil {
		return
	}
	var parent *discordgo.ApplicationCommandInteractionDataOption
	if cmd.SubCommands != nil && len(data.Options) != 0 {
		cmd, parent = cmd.SubCommands.GetSubCmd(cmd, data.Options[0])
	}

	if len(cmd.Roles) > 0 || len(cmd.Users) > 0 {
		allowed := false
		if len(cmd.Roles) > 0 {
			for _, role := range cmd.Roles {
				roleId := roles.GetIdForRole(role)
				if _, ok := utils.SliceFind(i.Member.Roles, func(rId string) bool { return rId == roleId }); ok {
					allowed = true
					break
				}
			}
		}

		if len(cmd.Users) > 0 && !allowed {
			if _, ok := utils.SliceFind(cmd.Users, func(s string) bool { return s == i.Member.User.ID }); ok {
				allowed = true
			}
		}

		// OP dev powers :EZ:
		if !allowed && i.Member.User.ID == "214294598766297088" {
			allowed = true
		}

		if !allowed {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "Seems like you don't have the rights to do that lil bro",
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
			return
		}
	}

	optArr := data.Options
	if parent != nil {
		optArr = parent.Options
	}
	optMap := make(map[string]*discordgo.ApplicationCommandInteractionDataOption)
	for _, opt := range optArr {
		optMap[opt.Name] = opt
	}

	errs := cmd.Handler(s, i, optMap)
	if errs != nil && len(errs) > 0 {
		logEntry := logrus.NewEntry(logrus.StandardLogger())
		for _, err := range errs {
			logEntry.WithError(err)
			sentry.CurrentHub().CaptureException(err)
		}
		logEntry.Errorf("Failed to handle %s command", cmd.Name)
	}
}

func RegisterCommand(cmd *Command) {
	commandSystem.commands[cmd.Name] = cmd
}

func RegisterCommands(cmds []*Command) {
	for _, c := range cmds {
		commandSystem.RegisterCommand(c)
	}
}
