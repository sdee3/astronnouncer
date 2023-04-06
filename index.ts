import sweph from "sweph";
import path from "path";

sweph.set_ephe_path(path.join(__dirname, "/public"));

const {
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SEFLG_SPEED,
  SEFLG_SWIEPH,
} = sweph.constants;

const PLANETS: any = {
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

const utcToJulianUt = (utcDate: Date) => {
  const milliSecondsInSeconds = utcDate.getUTCMilliseconds() / 1000;
  const secondsInMinutes =
    (utcDate.getUTCSeconds() + milliSecondsInSeconds) / 60;
  const minutesInHours = (utcDate.getUTCMinutes() + secondsInMinutes) / 60;

  const hours = utcDate.getUTCHours() + minutesInHours;

  return sweph.julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    hours,
    sweph.constants.SE_GREG_CAL
  );
};

const utcToJulianEt = (utcDate: Date) => {
  const julianUt = utcToJulianUt(utcDate);
  const delta = sweph.deltat(julianUt);
  return julianUt + delta;
};

const degreesToDms = (value: number) => {
  const position = sweph.split_deg(
    value,
    sweph.constants.SE_SPLIT_DEG_ZODIACAL
  );
  const { degree: degrees, minute: minutes, second: seconds } = position;
  return {
    degrees,
    minutes,
    seconds,
    longitude: value,
  };
};

const zodiacSign = (degrees: number) => (Math.floor(degrees / 30) % 12) + 1;

const normalizeDegrees = (degrees: number) => {
  if (degrees < -180) {
    return degrees + 360;
  }
  if (degrees > 180) {
    return degrees - 360;
  }

  return degrees;
};

const getPositionOfAstro = (astro: string, julianDay: number) =>
  sweph.calc(julianDay, PLANETS[astro], FLAG);

const isRetrograde = (speed: number) => speed < 0;

const position = (astrologyObject: string, moment: Date) => {
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

const planets = (date: Date) => {
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
