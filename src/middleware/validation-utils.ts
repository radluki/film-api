import { validationResult } from "express-validator";
import { GENRES } from "../config";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res
      .status(400)
      .json({ errors: errors.array().map((err) => err.msg) });
  };
};

export const commaSeparatedArraySanitizer = (value) => {
  const split = (item) => item.split(",");
  if (Array.isArray(value)) return [].concat(...value.map(split));
  return split(value);
};

export function validateBodyFieldNames(value, allowedFields: string[]) {
  const unknownFields = Object.keys(value).filter(
    (field) => !allowedFields.includes(field),
  );
  if (unknownFields.length == 0) return true;
  throw new Error(`Unknown fields: ${unknownFields.join(", ")}`);
}

export const genresValidator = (value: string[]) => {
  const invalid = value.filter((item) => !GENRES.includes(item));
  if (invalid.length == 0) return true;
  throw new Error(`Invalid genres: ${invalid.join(", ")}`);
};
