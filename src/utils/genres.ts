import fs from "fs";
import { logger } from "./logger";
import { loadGenres } from "./config-validation";
import { DBPATH } from "../config";


export function isGenreValid(genre) {
  return GENRES.includes(genre);
}

let GENRES = loadGenres(DBPATH);

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = undefined;
        func(...args)
      }, delay);
    }
  };
};

fs.watch(
  DBPATH,
  debounce((eventType) => {
    if (eventType === "change") {
      logger.info(`${DBPATH} has changed. Reloading...`);
      GENRES = loadGenres(DBPATH);
    }
  }, 500),
);
