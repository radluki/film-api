import { query } from "express-validator";
import { commaSeparatedArraySanitizer, validate } from "./validation-utils";
import { genresValidator } from "./genres-validation";

export const validateMoviesGetQuery = validate([
  query("duration")
    .optional()
    .isNumeric()
    .withMessage("Duration must be a number"),
  query("genres")
    .optional()
    .customSanitizer(commaSeparatedArraySanitizer)
    .custom(genresValidator),
]);
