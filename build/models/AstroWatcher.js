"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroWatcher = void 0;
const sweph_1 = __importDefault(require("sweph"));
const utils_1 = require("../utils");
class AstroWatcher {
    utcToJulianUt = (utcDate) => {
        const milliSecondsInSeconds = utcDate.getUTCMilliseconds() / 1000;
        const secondsInMinutes = (utcDate.getUTCSeconds() + milliSecondsInSeconds) / 60;
        const minutesInHours = (utcDate.getUTCMinutes() + secondsInMinutes) / 60;
        const hours = utcDate.getUTCHours() + minutesInHours;
        return sweph_1.default.julday(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), hours, sweph_1.default.constants.SE_GREG_CAL);
    };
    utcToJulianEt = (utcDate) => {
        const julianUt = this.utcToJulianUt(utcDate);
        const delta = sweph_1.default.deltat(julianUt);
        return julianUt + delta;
    };
    degreesToDms = (value) => {
        const position = sweph_1.default.split_deg(value, sweph_1.default.constants.SE_SPLIT_DEG_ZODIACAL);
        const { degree: degrees, minute: minutes, second: seconds } = position;
        return {
            degrees,
            minutes,
            seconds,
            longitude: value
        };
    };
    zodiacSign = (degrees) => (Math.floor(degrees / 30) % 12) + 1;
    normalizeDegrees = (degrees) => {
        if (degrees < -180) {
            return degrees + 360;
        }
        if (degrees > 180) {
            return degrees - 360;
        }
        return degrees;
    };
    getPositionOfAstro = (astro, julianDay) => sweph_1.default.calc(julianDay, utils_1.PLANETS[astro], utils_1.FLAG);
    isRetrograde = (speed) => speed < 0;
    position = (astrologyObject, moment) => {
        const julianDay = this.utcToJulianEt(moment);
        const { data } = this.getPositionOfAstro(astrologyObject, julianDay);
        const longitude = data[0];
        const speed = data[3];
        const dms = this.degreesToDms(longitude);
        const retrograde = this.isRetrograde(speed);
        return {
            position: {
                ...dms,
                longitude
            },
            speed,
            retrograde,
            sign: this.zodiacSign(longitude)
        };
    };
    planets = (date) => {
        return Object.keys(utils_1.PLANETS).reduce((accumulator, name) => {
            const planetPosition = this.position(name, date);
            accumulator[name] = {
                name,
                ...planetPosition,
                type: utils_1.planetsByType[name]
            };
            return accumulator;
        }, {});
    };
}
exports.AstroWatcher = AstroWatcher;
