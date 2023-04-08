"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sign = exports.FLAG = exports.planetsByType = exports.PLANETS = exports.SEFLG_SWIEPH = exports.SEFLG_SPEED = exports.SE_PLUTO = exports.SE_NEPTUNE = exports.SE_URANUS = exports.SE_SATURN = exports.SE_JUPITER = exports.SE_MARS = exports.SE_VENUS = exports.SE_MERCURY = exports.SE_MOON = exports.SE_SUN = void 0;
const sweph_1 = require("sweph");
exports.SE_SUN = sweph_1.constants.SE_SUN, exports.SE_MOON = sweph_1.constants.SE_MOON, exports.SE_MERCURY = sweph_1.constants.SE_MERCURY, exports.SE_VENUS = sweph_1.constants.SE_VENUS, exports.SE_MARS = sweph_1.constants.SE_MARS, exports.SE_JUPITER = sweph_1.constants.SE_JUPITER, exports.SE_SATURN = sweph_1.constants.SE_SATURN, exports.SE_URANUS = sweph_1.constants.SE_URANUS, exports.SE_NEPTUNE = sweph_1.constants.SE_NEPTUNE, exports.SE_PLUTO = sweph_1.constants.SE_PLUTO, exports.SEFLG_SPEED = sweph_1.constants.SEFLG_SPEED, exports.SEFLG_SWIEPH = sweph_1.constants.SEFLG_SWIEPH;
exports.PLANETS = {
    sun: exports.SE_SUN,
    moon: exports.SE_MOON,
    mercury: exports.SE_MERCURY,
    venus: exports.SE_VENUS,
    mars: exports.SE_MARS,
    jupiter: exports.SE_JUPITER,
    saturn: exports.SE_SATURN,
    uranus: exports.SE_URANUS,
    neptune: exports.SE_NEPTUNE,
    pluto: exports.SE_PLUTO
};
exports.planetsByType = {
    sun: 'luminary',
    moon: 'luminary',
    mercury: 'personal',
    venus: 'personal',
    mars: 'personal',
    jupiter: 'social',
    saturn: 'social',
    uranus: 'transpersonal',
    neptune: 'transpersonal',
    pluto: 'transpersonal'
};
exports.FLAG = exports.SEFLG_SPEED | exports.SEFLG_SWIEPH;
var Sign;
(function (Sign) {
    Sign[Sign["Aries"] = 1] = "Aries";
    Sign[Sign["Taurus"] = 2] = "Taurus";
    Sign[Sign["Gemini"] = 3] = "Gemini";
    Sign[Sign["Cancer"] = 4] = "Cancer";
    Sign[Sign["Leo"] = 5] = "Leo";
    Sign[Sign["Virgo"] = 6] = "Virgo";
    Sign[Sign["Libra"] = 7] = "Libra";
    Sign[Sign["Scorpio"] = 8] = "Scorpio";
    Sign[Sign["Sagittarius"] = 9] = "Sagittarius";
    Sign[Sign["Capricorn"] = 10] = "Capricorn";
    Sign[Sign["Aquarius"] = 11] = "Aquarius";
    Sign[Sign["Pisces"] = 12] = "Pisces";
})(Sign = exports.Sign || (exports.Sign = {}));
