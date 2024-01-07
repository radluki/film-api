import { validationResult } from "express-validator";
import { isGenreValid } from "../utils/genres";

export function validationGuard(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
}

export function commaSeparatedArraySanitizer(value) {
  const split = (item) => item.split(",");
  if (Array.isArray(value)) return [].concat(...value.map(split));
  return split(value);
}

export function validateBodyFieldNames(value, allowedFields: string[]) {
  const unknownFields = Object.keys(value).filter(
    (field) => !allowedFields.includes(field),
  );
  if (unknownFields.length == 0) return true;
  throw new Error(`Unknown fields: ${unknownFields.join(", ")}`);
}

export function genresValidator(value: string[]) {
  const isGenresInvalid = (genre) => !isGenreValid(genre);
  const invalid = value.filter(isGenresInvalid);
  if (invalid.length == 0) return true;
  throw new Error(`Invalid genres: ${invalid.join(", ")}`);
}
