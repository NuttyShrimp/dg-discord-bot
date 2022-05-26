declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      APPLICATION_ID: string;
      GUILD_ID: string;
      CLIENT_SECRET: string;
      // Message log channel
      MESSAGELOGCHANNEL: string;
      // React-role module
      UITLEGCHANNEL: string;
      REACT_ROLE_ID: string;
      BUG_SEND_CHANNEL: string;
      // Channel where bugs are posted
      BUG_RECEIVE_CHANNEL: string;
      SUGGESTION_CHANNEL: string;
      MARIADB_HOST: string;
      MARIADB_PORT: string;
      MARIADB_USER: string;
      MARIADB_PASSWORD: string;
      MARIADB_DATABASE: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
