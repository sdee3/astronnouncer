"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBot = void 0;
const discord_js_1 = require("discord.js");
class DiscordBot {
    constructor() {
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';
        const commands = [
            {
                name: 'ping',
                description: 'Replies with Pong!'
            }
        ];
        const client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.MessageContent]
        });
        client.on(discord_js_1.Events.ClientReady, (client) => {
            console.log('Client ready!', client.user.id);
        });
        client.login(DISCORD_BOT_TOKEN);
    }
    hi() {
        console.log('hi');
    }
}
exports.DiscordBot = DiscordBot;
