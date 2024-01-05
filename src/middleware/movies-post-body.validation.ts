import { body } from "express-validator";
import {
  getString255Validator,
  validate,
  validateBodyFieldNames,
} from "./validation-utils";
import { genresValidator } from "./genres-validation";

const MOVIE_FIELDS = [
  "title",
  "year",
  "runtime",
  "director",
  "genres",
  "actors",
  "plot",
  "posterUrl",
];
const validateMovieBodyFieldNames = (value) =>
  validateBodyFieldNames(value, MOVIE_FIELDS);

export const validateMoviesPostBody = validate([
  body().custom(validateMovieBodyFieldNames),
  body("title").custom(getString255Validator("title")),
  body("year").isNumeric().withMessage("numeric year is required"),
  body("runtime").isNumeric().withMessage("numeric runtime is required"),
  body("director").custom(getString255Validator("director")),
  body("genres")
    .isArray()
    .withMessage("genres must be an array")
    .bail()
    .custom(genresValidator),
  body("actors").optional().isString().withMessage("actors is optional string"),
  body("plot").optional().isString().withMessage("plot is optional string"),
  body("posterUrl")
    .optional()
    .isURL()
    .withMessage("posterUrl is an optional valid URL"),
]);
