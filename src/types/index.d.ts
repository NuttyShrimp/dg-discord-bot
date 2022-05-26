declare interface ServerPlayer {
  endpoint: string,
  id: number
  identifiers: string[],
  name: string,
  ping: number
}

declare interface ServerInformation {
  enhancedHostSupport: boolean;
  icon: string;
  resources: string[];
  server: string;
  vars: {[key: string]: string};
  version: number;
}