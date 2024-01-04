import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
validateConfig();

export const { DBPATH } = process.env;
export const PORT: number = +process.env.PORT || 3000;
export const GENRES: string[] = loadGenres(DBPATH);

function loadGenres(dbpath): string[] {
  const { genres } = require(`../${dbpath}`)
  return genres || [];
}

function validateConfig() {
  const { DBPATH, PORT } = process.env;
  const errors = [];
  if (PORT && isNaN(+PORT)) {
    console.warn(`WARNING!!! PORT is set to ${PORT}, using default value 3000`)
  }
  if (!DBPATH) {
    errors.push('DBPATH is not set');
  }
  if (!fs.existsSync(DBPATH)) {
    errors.push(`DBPATH ${DBPATH} file does not exist`);
  }
  if (errors.length > 0) {
    console.error(`ERROR!!! Invalid configuration, reasons:`, errors);
    process.exit(1);
  }
  const GENRES = loadGenres(DBPATH);
  if (GENRES.length == 0) {
    console.warn('WARNING!!! No genres found in DBPATH file')
  }
}
