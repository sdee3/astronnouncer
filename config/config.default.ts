import { config } from 'dotenv'

config()

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
export const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID ?? ''
export const ASTRO_CHECK_INTERVAL = 1000
