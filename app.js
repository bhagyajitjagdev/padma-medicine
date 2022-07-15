/* eslint-disable no-unused-vars */
const env = require("dotenv");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const findRemoveSync = require("find-remove");
const { readdirSync } = require("fs");

const moment = require("moment");

global.__basedir = __dirname;

env.config({ path: ".env" }); // MENTION THE INSTANCE HERE TO RUN AS DEFAULT

env.config({
  path: `.env.${process.env.NODE_ENV.trim()}`,
});

const app = express();

// DATABASE CONNECTION
require("./src/NOSQL/database/connection");

const api = require("./src/v1/routes/api");
const { dbBackupTask } = require("./src/v1/functions/function");

app.use(helmet());
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, _path, stat) {
      res.set("x-timestamp", Date.now().toString());
    },
  })
);

app.use(
  morgan("common", {
    skip: (req, res) => req.originalUrl.startsWith("/socket"),
  })
);

app.use("/", express.static(`${__dirname}/padma-medicine-frontend/dist/padma-medicine-frontend/`));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use("/app", (req, res, next) => {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile("index.html", { root: `${__dirname}/padma-medicine-frontend/dist/padma-medicine-frontend/` });
});

app.use("/v1/api/", api);

module.exports = app;

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

setInterval(() => {
  const date = moment().utcOffset("+05:30").format("YYYY_MM_DD-HH_mm_ss");

  let folders = [];
  try {
    folders = getDirectories("backup").map((v) => v.split("-")[0]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.message);
  }

  if (!folders.includes(date.split("-")[0])) {
    // eslint-disable-next-line no-console
    console.debug(`>> ran backup at ${date}`);
    dbBackupTask(date);
  }

  if (folders.length > 30) {
    findRemoveSync("./backup", { dir: "*", age: { seconds: 2630000 } }); // 2630000 => 1 month
  }
}, 10000);
