import { query } from "express-validator";
import {
  commaSeparatedArraySanitizer,
  genresValidator,
  validationGuard,
} from "./validation-utils";

export const validateMoviesGetQuery = [
  query("duration")
    .optional()
    .isNumeric()
    .withMessage("duration must be a number"),
  query("genres")
    .optional()
    .customSanitizer(commaSeparatedArraySanitizer)
    .isArray()
    .custom(genresValidator),
  validationGuard,
];
