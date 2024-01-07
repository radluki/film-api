import * as dotenv from "dotenv";
import {
  EnvVars,
  validateEnvVars,
} from "./utils/config-validation";

dotenv.config();

export const { DBPATH, PORT }: EnvVars = validateEnvVars(process.env);
