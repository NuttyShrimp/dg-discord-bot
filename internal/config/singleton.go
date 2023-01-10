package config

var store = &ConfigManager{
	Options: make(map[string]*ConfigOption),
}

func Load() error {
	return store.Load()
}

func RegisterOption(name string, defaultVal interface{}) *ConfigOption {
	return store.RegisterOption(name, defaultVal)
}
