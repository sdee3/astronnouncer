"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const sweph_1 = __importDefault(require("sweph"));
const path_1 = __importDefault(require("path"));
sweph_1.default.set_ephe_path(path_1.default.join(__dirname, '/public'));
const astroWatcher = new models_1.AstroWatcher();
const discordBot = new models_1.DiscordBot(astroWatcher);
