import { config } from 'dotenv'

config()

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
export const MY_GENERAL_CHANNEL_ID = process.env.MY_GENERAL_CHANNEL_ID ?? ''
export const MY_TEST_CHANNEL_ID = process.env.MY_TEST_CHANNEL_ID ?? ''
export const ASTRO_CHECK_INTERVAL = 10_000
