const path = require("path");
const { createLogger, format, transports } = require("winston");

const { combine, timestamp, json } = format;

module.exports = {
  logger: createLogger({
    format: combine(
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(__dirname, "logs/server.log"),
      }),
    ],
  }),

  userLogger: createLogger({
    defaultMeta: { component: "user-service" },
    format: combine(
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: path.join(__dirname, "logs/user.log") }),
    ],
  }),
};
