import { body } from "express-validator";
import { getArrayFieldsValidator, validate } from "./validation-utils";

function validateBodyFieldNames(value) {
  const allowedFields = ['title', 'year', 'runtime', 'director', 'genres', 'actors', 'plot', 'posterUrl'];
  const unknownFields = Object.keys(value).filter(field => !allowedFields.includes(field));
  if (unknownFields.length == 0) return true;
  throw new Error(`Unknown fields: ${unknownFields.join(', ')}`);
}

function getString255Validator(fieldName) {
  return (value) => {
    if (typeof value !== 'string') throw new Error(`${fieldName} is a required string with max length 255`);
    if (value.length > 255)
      throw new Error(`${fieldName} is too long, max length is 255, actual length is ${value.length}`);
    return true;
  }
}

export function getMoviesPostBodyValidator(allowedGenres: string[]) {
  const allowedGenresValidator = getArrayFieldsValidator(allowedGenres);
  const validatePostBody = validate([
    body().custom(validateBodyFieldNames),
    body('title').custom(getString255Validator('title')),
    body('year').isNumeric().withMessage('numeric year is required'),
    body('runtime').isNumeric().withMessage('numeric runtime is required'),
    body('director').custom(getString255Validator('director')),
    body('genres').custom(allowedGenresValidator),
    body('actors').optional().isString().withMessage('actors is optional string'),
    body('plot').optional().isString().withMessage('plot is optional string'),
    body('posterUrl').optional().isURL().withMessage('posterUrl is an optional valid URL'),
  ]);
  return validatePostBody;
}