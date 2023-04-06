"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sweph_1 = __importDefault(require("sweph"));
const path_1 = __importDefault(require("path"));
sweph_1.default.set_ephe_path(path_1.default.join(__dirname, "/public"));
const { SE_SUN, SE_MOON, SE_MERCURY, SE_VENUS, SE_MARS, SE_JUPITER, SE_SATURN, SE_URANUS, SE_NEPTUNE, SE_PLUTO, SEFLG_SPEED, SEFLG_SWIEPH, } = sweph_1.default.constants;
const PLANETS = {
    sun: SE_SUN,
    moon: SE_MOON,
    mercury: SE_MERCURY,
    venus: SE_VENUS,
    mars: SE_MARS,
    jupiter: SE_JUPITER,
    saturn: SE_SATURN,
    uranus: SE_URANUS,
    neptune: SE_NEPTUNE,
    pluto: SE_PLUTO,
};
const planetsByType = {
    sun: "luminary",
    moon: "luminary",
    mercury: "personal",
    venus: "personal",
    mars: "personal",
    jupiter: "social",
    saturn: "social",
    uranus: "transpersonal",
    neptune: "transpersonal",
    pluto: "transpersonal",
};
const FLAG = SEFLG_SPEED | SEFLG_SWIEPH;
const utcToJulianUt = (utcDate) => {
    const milliSecondsInSeconds = utcDate.getUTCMilliseconds() / 1000;
    const secondsInMinutes = (utcDate.getUTCSeconds() + milliSecondsInSeconds) / 60;
    const minutesInHours = (utcDate.getUTCMinutes() + secondsInMinutes) / 60;
    const hours = utcDate.getUTCHours() + minutesInHours;
    return sweph_1.default.julday(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), hours, sweph_1.default.constants.SE_GREG_CAL);
};
const utcToJulianEt = (utcDate) => {
    const julianUt = utcToJulianUt(utcDate);
    const delta = sweph_1.default.deltat(julianUt);
    return julianUt + delta;
};
const degreesToDms = (value) => {
    const position = sweph_1.default.split_deg(value, sweph_1.default.constants.SE_SPLIT_DEG_ZODIACAL);
    const { degree: degrees, minute: minutes, second: seconds } = position;
    return {
        degrees,
        minutes,
        seconds,
        longitude: value,
    };
};
const zodiacSign = (degrees) => (Math.floor(degrees / 30) % 12) + 1;
const normalizeDegrees = (degrees) => {
    if (degrees < -180) {
        return degrees + 360;
    }
    if (degrees > 180) {
        return degrees - 360;
    }
    return degrees;
};
const getPositionOfAstro = (astro, julianDay) => sweph_1.default.calc(julianDay, PLANETS[astro], FLAG);
const isRetrograde = (speed) => speed < 0;
const position = (astrologyObject, moment) => {
    const julianDay = utcToJulianEt(moment);
    const { data } = getPositionOfAstro(astrologyObject, julianDay);
    const longitude = data[0];
    const speed = data[3];
    const dms = degreesToDms(longitude);
    const retrograde = isRetrograde(speed);
    return {
        position: {
            ...dms,
            longitude,
        },
        speed,
        retrograde,
        sign: zodiacSign(longitude),
    };
};
const planets = (date) => {
    return Object.keys(PLANETS).reduce((accumulator, name) => {
        const planetPosition = position(name, date);
        accumulator[name] = {
            name,
            ...planetPosition,
            type: planetsByType[name],
        };
        return accumulator;
    }, {});
};
console.log(planets(new Date()));
