# Astronnouncer - A simple Discord bot

![Astronnouncer Logo](public/logo.png)

Astronnouncer is a very lightweight Discord bot based on the amazing [Swiss Ephemeris](https://www.astro.com/swisseph/swephinfo_e.htm) that planetary movements.

Since v1.1.1, detecting major aspects (conjunctions, sextiles, squares, trines, oppositions) is also supported.

Since v1.2.0, it will automatically send messages to every #general channel you add it to.

## Got feature requests?

Don't be shy! Feel free to [submit them publicly on my GitHub repo](https://github.com/sdee3/astronnouncer/issues/new)!

### Upcoming features

/

## Production environment setup

To get your bot deployed, set the following `.env` variable:

```txt
DISCORD_BOT_TOKEN="DISCORD_BOT_TOKEN"
MY_GENERAL_CHANNEL_ID="XXXXXX"
MY_TEST_CHANNEL_ID="XXXXXX"
```

Run `pnpm start:prod` to launch a `pm2` instance that monitors the production Node build in the background.
