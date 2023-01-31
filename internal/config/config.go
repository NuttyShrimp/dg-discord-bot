package config

import (
	"errors"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type ConfigOption struct {
	Name         string
	DefaultValue interface{}
	LoadedValue  interface{}
}

func (opt *ConfigOption) LoadValue() {
	newVal := opt.DefaultValue
	v := os.Getenv(opt.Name)
	if v != "" {
		newVal = v
	}
	opt.LoadedValue = newVal
}

func (opt *ConfigOption) GetString() string {
	return strVal(opt.LoadedValue)
}

func (opt *ConfigOption) GetInt() int {
	return intVal(opt.LoadedValue)
}

func (opt *ConfigOption) GetBool() bool {
	return boolVal(opt.LoadedValue)
}

type ConfigManager struct {
	Options map[string]*ConfigOption
}

func (mg *ConfigManager) RegisterOption(name string, defaultValue interface{}) *ConfigOption {
	option := &ConfigOption{
		Name:         name,
		DefaultValue: defaultValue,
	}
	mg.Options[name] = option
	return option
}

func (mg *ConfigManager) Load() error {
	err := godotenv.Load()
	if err != nil {
		return errors.New("Error loading .env file")
	}
	for _, option := range mg.Options {
		option.LoadValue()
	}
	return nil
}

func strVal(i interface{}) string {
	switch t := i.(type) {
	case string:
		return t
	case int:
		return strconv.FormatInt(int64(t), 10)
	case Stringer:
		return t.String()
	}

	return ""
}

type Stringer interface {
	String() string
}

func intVal(i interface{}) int {
	switch t := i.(type) {
	case string:
		n, _ := strconv.ParseInt(t, 10, 64)
		return int(n)
	case int:
		return t
	}

	return 0
}

func boolVal(i interface{}) bool {
	switch t := i.(type) {
	case string:
		lower := strings.ToLower(strings.TrimSpace(t))
		if lower == "true" || lower == "yes" || lower == "on" || lower == "enabled" || lower == "1" {
			return true
		}

		return false
	case int:
		return t > 0
	case bool:
		return t
	}

	return false
}
