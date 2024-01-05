import fs from "fs";
import path from "path";
import { dbDataSchema } from "./db-validation";
import Joi from "joi";

const validatePathExists = (value) => {
  if (fs.existsSync(value)) return value;
  throw new Error(`${value} file does not exist`);
};

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DBPATH: Joi.string().required().custom(validatePathExists),
}).unknown();

export function validateEnvVars(envVars): EnvVars {
  const { error, value } = envVarsSchema.validate(envVars);
  if (error) {
    console.error(`Config validation error: ${error.message}`);
    process.exit(1);
  }
  return value;
}

export interface EnvVars {
  PORT: number;
  DBPATH: string;
}

export function loadGenres(dbpath): string[] {
  dbpath = path.resolve(dbpath);
  console.log(`Loading genres from ${dbpath}`);
  const rawData = JSON.parse(fs.readFileSync(dbpath, "utf-8"));
  const {
    error,
    value: { genres },
  } = dbDataSchema.validate(rawData);
  if (error) {
    console.error(`Database validation failed: ${error.message}`);
    process.exit(1);
  }

  console.log(`Loaded genres:`, genres);
  return genres;
}