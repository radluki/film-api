import { validationResult } from "express-validator";

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

export function getArrayFieldsValidator(allowedElements) {
  const validator = (value) => {
    if (!Array.isArray(value)) throw new Error("genres must be an array");
    const invalid = value.filter((item) => !allowedElements.includes(item));
    if (invalid.length == 0) return true;
    throw new Error(`Invalid genres: ${invalid.join(", ")}`);
  };
  return validator;
}

export function getString255Validator(fieldName) {
  return (value) => {
    if (typeof value !== "string")
      throw new Error(`${fieldName} is a required string with max length 255`);
    if (value.length > 255)
      throw new Error(
        `${fieldName} is too long, max length is 255, actual length is ${value.length}`,
      );
    return true;
  };
}

export function validateBodyFieldNames(value, allowedFields: string[]) {
  const unknownFields = Object.keys(value).filter(
    (field) => !allowedFields.includes(field),
  );
  if (unknownFields.length == 0) return true;
  throw new Error(`Unknown fields: ${unknownFields.join(", ")}`);
}
