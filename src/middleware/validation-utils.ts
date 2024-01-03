import { validationResult } from 'express-validator';


export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty())
      return next();
    return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
  };
};

export const splitStringToArray = (value) => (typeof value === 'string' ? value.split(',') : [value])

export function getArrayFieldsValidator(allowedElements) {
  const validator = (value) => {
    if (!Array.isArray(value))
      throw new Error('genres must be an array');
    const invalid = value.filter((item) => !allowedElements.includes(item));
    if (invalid.length == 0)
      return true;
    throw new Error(`Invalid genres: ${invalid.join(', ')}`);
  }
  return validator;
}