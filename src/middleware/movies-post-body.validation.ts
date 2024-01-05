import { body } from "express-validator";
import {
  validateBodyFieldNames,
  genresValidator,
  validationGuard,
} from "./validation-utils";

export const validateMoviesPostBody = [
  body().custom(validateMovieBodyFieldNames),
  body("title")
    .isString()
    .withMessage(getString255MsgFactory("title"))
    .isLength({ max: 255 })
    .withMessage(getInvalidLengthMsgFactory("title")),
  body("year").isNumeric().withMessage("numeric year is required"),
  body("runtime").isNumeric().withMessage("numeric runtime is required"),
  body("director")
    .isString()
    .withMessage(getString255MsgFactory("director"))
    .isLength({ max: 255 })
    .withMessage(getInvalidLengthMsgFactory("director")),
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
  validationGuard,
];

function validateMovieBodyFieldNames(value: string[]) {
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
  return validateBodyFieldNames(value, MOVIE_FIELDS);
}

function getString255MsgFactory(fieldName) {
  return `${fieldName} is a required string with max length 255`;
}
function getInvalidLengthMsgFactory(fieldName) {
  return (value) =>
    `${fieldName} is too long, max length is 255, actual length is ${value.length}`;
}
