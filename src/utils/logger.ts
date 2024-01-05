import winston from "winston";

export const logger = winston.createLogger({
  silent: process.env.NODE_ENV === "test",
  level: "debug",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
  ],
});
