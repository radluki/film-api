import * as dotenv from "dotenv";
import {
  EnvVars,
  loadGenres,
  validateEnvVars,
} from "./utils/config-validation";

dotenv.config();

export const { DBPATH, PORT }: EnvVars = validateEnvVars(process.env);
export const GENRES = loadGenres(DBPATH);
