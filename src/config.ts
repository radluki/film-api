import * as dotenv from "dotenv";
import {
  EnvVars,
  loadGenres,
  validateEnvVars,
} from "./utils/config-validation";
import fs from "fs";
import { logger } from "./utils/logger";

dotenv.config();

export const { DBPATH, PORT }: EnvVars = validateEnvVars(process.env);
export let GENRES = loadGenres(DBPATH);

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

fs.watch(
  DBPATH,
  debounce((eventType) => {
    if (eventType === "change") {
      logger.info(`${DBPATH} has changed. Reloading...`);
      GENRES = loadGenres(DBPATH);
    }
  }, 200),
);
