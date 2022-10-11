export const config: Record<keyof Omit<NodeJS.ProcessEnv, "TZ">, string> = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  APPLICATION_ID: process.env.APPLICATION_ID || "",
  GUILD_ID: process.env.GUILD_ID || "",
  // Message log channel
  MESSAGELOGCHANNEL: process.env.MESSAGELOGCHANNEL || "",
  // React-role module
  UITLEGCHANNEL: process.env.UITLEGCHANNEL || "",
  REACT_ROLE_ID: process.env.REACT_ROLE_ID || "",
  BUG_SEND_CHANNEL: process.env.BUG_SEND_CHANNEL || "",
  BUG_RECEIVE_CHANNEL: process.env.BUG_RECEIVE_CHANNEL || "",
  SUGGESTION_CHANNEL: process.env.SUGGESTION_CHANNEL || "",
  MARIADB_HOST: process.env.MARIADB_HOST || "",
  MARIADB_PORT: process.env.MARIADB_PORT || "",
  MARIADB_USER: process.env.MARIADB_USER || "",
  MARIADB_PASSWORD: process.env.MARIADB_PASSWORD || "",
  MARIADB_DATABASE: process.env.MARIADB_DATABASE || "",
};

// No value in config can be empty
export const checkConfig = (): void => {
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Config value ${key} is empty`);
    }
  });
};