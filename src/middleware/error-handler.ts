import { logger } from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  res.status(500).send({
    message: "Internal Server Error",
    error: err.message,
  });
};
