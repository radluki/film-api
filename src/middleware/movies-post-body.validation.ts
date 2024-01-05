import { body } from "express-validator";
import { validate, validateBodyFieldNames } from "./validation-utils";
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

const titleMsg = "title is a required string with max length 255";
const directorMsg = "director is a required string with max length 255";
const lengthErrorMsgFactory = (value, fieldName) =>
  `${fieldName} is too long, max length is 255, actual length is ${value.length}`;

export const validateMoviesPostBody = validate([
  body().custom(validateMovieBodyFieldNames),
  body("title")
    .isString()
    .withMessage(titleMsg)
    .isLength({ max: 255 })
    .withMessage((value) => lengthErrorMsgFactory(value, "title")),
  body("year").isNumeric().withMessage("numeric year is required"),
  body("runtime").isNumeric().withMessage("numeric runtime is required"),
  body("director")
    .isString()
    .withMessage(directorMsg)
    .isLength({ max: 255 })
    .withMessage((value) => lengthErrorMsgFactory(value, "director")),
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
