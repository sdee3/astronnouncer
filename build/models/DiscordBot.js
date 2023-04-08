"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBot = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
class DiscordBot {
    astroWatcher;
    messageInterval = null;
    previousPlanetPositions = new Map();
    constructor(astroWatcher) {
        this.astroWatcher = astroWatcher;
        const client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.MessageContent]
        });
        client.on(discord_js_1.Events.ClientReady, async (client) => {
            const channel = await client.channels.fetch(config_1.GENERAL_CHANNEL_ID);
            if (!channel) {
                return;
            }
            this.messageInterval = this.fetchPlanetaryPositions(channel);
        });
        process.on('exit', () => this.clearInterval());
        client.on(discord_js_1.Events.ChannelDelete, () => this.clearInterval());
        client.on(discord_js_1.Events.Error, () => this.clearInterval());
        client.login(config_1.DISCORD_BOT_TOKEN);
    }
    clearInterval() {
        if (this.messageInterval !== null) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
    }
    fetchPlanetaryPositions = (channel) => {
        const interval = setInterval(async () => {
            const { positions, names, signs } = this.astroWatcher.planets(new Date());
            let previousSize = this.previousPlanetPositions.size;
            positions.forEach(async (position, index) => {
                const previousPosition = this.previousPlanetPositions.get(names[index]);
                if (previousPosition?.position.degrees === position.degrees &&
                    previousPosition?.position.minutes === position.minutes &&
                    previousPosition?.sign === signs[index] &&
                    this.previousPlanetPositions.size > 0) {
                    // The previous and current value is the same, so we don't need to send a message
                    return;
                }
                this.previousPlanetPositions.set(names[index], {
                    position: positions[index],
                    sign: signs[index]
                });
                if (previousSize === 0) {
                    // We don't want to send a message on the first run
                    return;
                }
                if (position.degrees === 0 &&
                    position.minutes === 0 &&
                    previousPosition?.position.degrees !== 0 &&
                    previousPosition?.position.minutes !== 0) {
                    // The planet has changed signs, so we send a message
                    const name = names[index];
                    const message = this.getFormattedMessageForPlanet(name);
                    if (!message)
                        return;
                    await channel.send(message);
                }
            });
        }, config_1.ASTRO_CHECK_INTERVAL);
        return interval;
    };
    /**
     * Retrieves a message for the Discord channel saying that a planet changed signs.
     */
    getFormattedMessageForPlanet = (planetName) => {
        const planetData = this.previousPlanetPositions.get(planetName);
        if (!planetData)
            return null;
        const { sign } = planetData;
        return `${planetName} entered ${sign}!`;
    };
}
exports.DiscordBot = DiscordBot;
