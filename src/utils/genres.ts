import fs from "fs";
import { logger } from "./logger";
import { loadGenres } from "./config-validation";
import { DBPATH } from "../config";

export function isGenreValid(genre) {
  return GENRES.includes(genre);
}

let GENRES = loadGenres(DBPATH);

const debounce = (func, delay, eventType) => {
  let timeout;
  return (...args) => {
    if (!timeout && args[0] === eventType) {
      timeout = setTimeout(() => {
        timeout = undefined;
        func(...args);
      }, delay);
    }
  };
};

fs.watch(
  DBPATH,
  debounce(
    () => {
      logger.info(`${DBPATH} has changed. Reloading...`);
      GENRES = loadGenres(DBPATH);
    },
    500,
    "change",
  ),
);
