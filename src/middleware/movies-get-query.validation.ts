import { query } from "express-validator";
import {
  commaSeparatedArraySanitizer,
  validate,
  genresValidator,
} from "./validation-utils";

export const validateMoviesGetQuery = validate([
  query("duration")
    .optional()
    .isNumeric()
    .withMessage("Duration must be a number"),
  query("genres")
    .optional()
    .customSanitizer(commaSeparatedArraySanitizer)
    .isArray()
    .custom(genresValidator),
]);
