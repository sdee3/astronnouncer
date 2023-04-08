# Astronnouncer - A simple Discord bot

![Astronnouncer Logo](public/logo.png)

Astronnouncer is a very lightweight Discord bot based on the amazing [Swiss Ephemeris](https://www.astro.com/swisseph/swephinfo_e.htm) that planetary movements.

## Got feature requests?

Don't be shy! Feel free to [submit them publicly on my GitHub repo](https://github.com/sdee3/astronnouncer/issues/new)!

### Features coming up

1. Detecting major aspects (conjunctions, sextiles, squares, trines, oppositions)

## Production environment setup

To get your bot deployed, set the following `.env` variables:

```txt
DISCORD_BOT_TOKEN="DISCORD_BOT_TOKEN"
GENERAL_CHANNEL_ID="GENERAL_CHANNEL_ID"
```

Run `pnpm start:prod` to launch a `pm2` instance that monitors the production Node build in the background.

## Unit tests

`pnpm test`. Any `*.spec.ts` file will automatically get tested by Jest.
