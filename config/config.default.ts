import { config } from 'dotenv'
import { Environment } from '../utils'

config()

export const NODE_ENV: Environment =
  (process.env.NODE_ENV as Environment | undefined) ??
  ('development' as Environment)
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
export const MY_GENERAL_CHANNEL_ID = process.env.MY_GENERAL_CHANNEL_ID ?? ''
export const MY_TEST_CHANNEL_ID = process.env.MY_TEST_CHANNEL_ID ?? ''
export const ASTRO_CHECK_INTERVAL = 10_000
export const CHANNEL_CHECK_INTERVAL = 1_000
