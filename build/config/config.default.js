"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTRO_CHECK_INTERVAL = exports.GENERAL_CHANNEL_ID = exports.DISCORD_BOT_TOKEN = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';
exports.GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID ?? '';
exports.ASTRO_CHECK_INTERVAL = 10000;
