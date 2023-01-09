declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      APPLICATION_ID: string;
      GUILD_ID: string;
      // Message log channel
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
export {};
