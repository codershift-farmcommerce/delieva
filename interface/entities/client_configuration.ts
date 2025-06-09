export enum ConfigurationKey {
  TIMEZONE = 'timezone',
}

export type Configuration = {
  [key in ConfigurationKey]: {
    value: string
  }
}
