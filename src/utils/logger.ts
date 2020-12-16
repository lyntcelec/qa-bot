import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  defaultMeta: { service: "google-qa" },
  transports: [new transports.Console(), new transports.File({ filename: "./logs/gg-qa.log" })],
});

export = logger;
