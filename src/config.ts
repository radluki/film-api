import * as dotenv from 'dotenv';

dotenv.config();

export const DBPATH: string = process.env.DBPATH;
export const PORT: number = parseInt(process.env.PORT);
export const GENRES: string[] = loadGenres();

function loadGenres(): string[] {
  const { genres } = require(`../${process.env.DBPATH}`)
  return genres;
}