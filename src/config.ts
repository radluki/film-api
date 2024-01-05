import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { dbDataSchema } from "./utils/db-validation";

dotenv.config();
validateConfig();

export const { DBPATH } = process.env;
export const PORT: number = +process.env.PORT || 3000;
export const GENRES: string[] = loadGenres(DBPATH);

function loadGenres(dbpath): string[] {
  dbpath = path.resolve(dbpath);
  console.log(`Loading genres from ${dbpath}`);
  const rawData = JSON.parse(fs.readFileSync(dbpath, "utf-8"));

  const {
    error,
    value: { genres },
  } = dbDataSchema.validate(rawData);
  if (error) {
    console.error(`ERROR!!! Database validation failed:`, error.message);
    process.exit(1);
  }

  console.log(`Loaded genres:`, genres);
  return genres;
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
