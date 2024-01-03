import { query } from "express-validator";
import { getArrayFieldsValidator, splitStringToArray, validate } from "./validation-utils";


export function getMoviesGetQueryValidator(allowedGenres: string[]) {
  const allowedGenresValidator = getArrayFieldsValidator(allowedGenres);
  const valdateMoviesGetQuery = validate([
    query('duration').optional().isNumeric().withMessage('Duration must be a number'),
    query('genres')
      .optional()
      .customSanitizer(splitStringToArray)
      .custom(allowedGenresValidator),
  ]);
  return valdateMoviesGetQuery;
}