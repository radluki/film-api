import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
validateConfig();

export const { DBPATH } = process.env;
export const PORT: number = +process.env.PORT || 3000;
export const GENRES: string[] = loadGenres(DBPATH);

function loadGenres(dbpath): string[] {
  console.log(`Loading genres from ${dbpath}`);
  dbpath = path.resolve(dbpath);
  console.log(`dbpath resolved to ${dbpath}`);
  const { genres } = require(dbpath); // eslint-disable-line
  console.log(`Loaded genres:`, genres);
  return genres || [];
}

function validateConfig() {
  const { DBPATH, PORT } = process.env;
  const errors = [];
  if (PORT && isNaN(+PORT)) {
    console.warn(`WARNING!!! PORT is set to ${PORT}, using default value 3000`);
  }
  if (!DBPATH) {
    errors.push("DBPATH is not set");
  }
  if (!fs.existsSync(DBPATH)) {
    errors.push(`DBPATH ${DBPATH} file does not exist`);
  }
  if (errors.length > 0) {
    console.error(`ERROR!!! Invalid configuration, reasons:`, errors);
    process.exit(1);
  }
}
