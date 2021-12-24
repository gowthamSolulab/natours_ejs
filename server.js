const mongoose = require("mongoose");
const { logger } = require("./log/logger");

const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  logger.error(` Uncaught Exception  - ${err.name} - ${err.message}`);
  // console.log("Uncaught Exception", err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

// database connection
mongoose.connect(
  process.env.DATABASE_LOCAL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log("connected to Database");
  }
);

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  logger.error(` Unhandled rejection  - ${err.name} - ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
