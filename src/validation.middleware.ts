import { query, validationResult } from 'express-validator';


export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty())
      return next();
    return res.status(400).json({ errors: errors.array().map((err) => err.msg) });
  };
};

export const splitStringToArray = (value) => (typeof value === 'string' ? value.split(',') : value)