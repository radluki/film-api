import { body } from "express-validator";
import {
  validateBodyFieldNames,
  genresValidator,
  validationGuard,
} from "./validation-utils";

export const validateMoviesPostBody = [
  bodyRejectUnknownFields(),
  bodyString255("title"),
  bodyNumeric("year"),
  bodyNumeric("runtime"),
  bodyString255("director"),
  bodyValidGenresArray(),
  bodyOptionalString("actors"),
  bodyOptionalString("plot"),
  bodyOptionalUrl("posterUrl"),
  validationGuard,
];

function bodyOptionalUrl(fieldName: string) {
  return body(fieldName)
    .optional()
    .isURL()
    .withMessage(`${fieldName} is an optional valid URL`);
}

function bodyValidGenresArray() {
  return body("genres")
    .isArray()
    .withMessage("genres must be an array")
    .bail()
    .custom(genresValidator);
}

function bodyNumeric(fieldName: string) {
  return body(fieldName)
    .isNumeric()
    .withMessage(`numeric ${fieldName} is required`);
}

function bodyString255(fieldName: string) {
  return body(fieldName)
    .isString()
    .withMessage(getString255MsgFactory(fieldName))
    .isLength({ max: 255 })
    .withMessage(getInvalidLengthMsgFactory(fieldName));

  function getString255MsgFactory(fieldName) {
    return `${fieldName} is a required string with max length 255`;
  }
  function getInvalidLengthMsgFactory(fieldName) {
    return (value) =>
      `${fieldName} is too long, max length is 255, actual length is ${value.length}`;
  }
}

function bodyOptionalString(fieldName: string) {
  return body(fieldName)
    .optional()
    .isString()
    .withMessage(`${fieldName} is optional string`);
}

function bodyRejectUnknownFields() {
  return body().custom(validateMovieBodyFieldNames);

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
}
