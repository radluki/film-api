import Joi from "joi";
import { DbData } from "../models/db.types";

const genresSchema = Joi.array().items(Joi.string()).required();

const movieSchema = Joi.object({
  id: Joi.number().required(),
  genres: genresSchema,
  title: Joi.string().required(),
  year: Joi.number().required(),
  runtime: Joi.number().required(),
  director: Joi.string().required(),
  actors: Joi.string(),
  plot: Joi.string(),
  posterUrl: Joi.string().allow(""),
});

export const dbDataSchema = Joi.object({
  genres: genresSchema,
  movies: Joi.array().items(movieSchema).required(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateDbData = (data: any): DbData => {
  const { error, value } = dbDataSchema.validate(data);

  if (error) {
    throw new Error(`Database validation failed: ${error.message}`);
  }

  return value;
};
