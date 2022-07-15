/* eslint-disable no-console */
const { uniqueNamesGenerator, names, adjectives, colors, NumberDictionary } = require("unique-names-generator");
const { AvatarGenerator } = require("random-avatar-generator");
const jwt = require("jsonwebtoken");
const { spawn } = require("child_process");

const numbers = NumberDictionary.generate({ min: 100, max: 999 });

exports.GenerateToken = (user) =>
  jwt.sign(
    {
      userCode: user.userCode,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET,
    {
      expiresIn: "30days",
    }
  );

exports.uniqueNames = () => {
  const customNameConfig = {
    dictionaries: [adjectives, colors, names, numbers],
    separator: "",
    style: "capital",
    length: 4,
  };

  return uniqueNamesGenerator(customNameConfig);
};

exports.randomAvatar = () => {
  const generator = new AvatarGenerator();
  return generator.generateRandomAvatar();
};

const fs = require("fs");
const path = require("path");

const createDirectories = (dirname, pathname) => {
  fs.mkdirSync(path.resolve(dirname, pathname), { recursive: true }, (e) => {
    if (e) {
      console.error(e);
    } else {
      console.log("Success");
    }
  });
};

exports.dbBackupTask = (date) => {
  const dirname = `${path.resolve()}/backup`;

  createDirectories(dirname, date);
  const backupProcess = spawn("mongodump", ["--db=padma", `--out=${`${dirname}/${date}`}`]);

  backupProcess.on("exit", (code, signal) => {
    if (code) console.log(">> Backup process exited with code ", code);
    else if (signal) console.error(">> Backup process was killed with signal ", signal);
    else console.log(">> Successfully backup the database");
  });
};
