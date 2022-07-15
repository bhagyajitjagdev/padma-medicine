const Bcryptjs = require("bcryptjs");
const { OK, ERROR } = require("../../../utils/responseHelper");
const UserService = require("../services/user.service");
const { GenerateToken, uniqueNames } = require("../functions/function");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const isUserPresent = await UserService.checkUser(email);

    if (isUserPresent) return ERROR(res, null, "A user is already registered with this email");

    const hashPassword = await Bcryptjs.hash(password, 12);

    const body = {
      firstName,
      lastName,
      password: hashPassword,
      email,
      userName: uniqueNames(),
    };

    const createdUser = await UserService.createUser(body);

    const token = GenerateToken(createdUser);

    return OK(res, { createdUser, token }, "user registered successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userCode, firstName, lastName, userName, email, role, isApproved, isDeleted } = req.body;

    const body = {};

    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (userName) body.userName = userName;
    if (email) body.email = email;

    if (req.payload.role === "ADMIN" && role) body.role = role;
    if (req.body.hasOwnProperty("isApproved")) body.isApproved = isApproved;
    if (req.body.hasOwnProperty("isDeleted")) body.isDeleted = isDeleted;

    if (!Object.keys(body).length) return ERROR(res, null, "Nothing to update");

    const user = await UserService.updateUser(userCode || req.payload.userCode, body);
    return OK(res, user, "user updated successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userPresent = await UserService.checkUser(email);

    const hashPassword = await Bcryptjs.hash(password, 12);

    const body = {
      password: hashPassword,
    };

    const user = await UserService.updateUser(userPresent.userCode, body);
    return OK(res, user, "password changed successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userPresent = await UserService.checkUser(email);

    if (userPresent) {
      const hashedPassword = await Bcryptjs.compare(password, userPresent.password);

      if (!hashedPassword) return ERROR(res, null, "invalid email or password");

      const token = GenerateToken(userPresent);

      return OK(res, { userPresent, token }, "user login successfully");
    }

    return ERROR(res, null, "invalid email or password");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, userCode, email } = req.query;

    const body = {};

    if (userCode) body.userCode = userCode;
    if (email) body.email = email;

    if (search)
      body.$or = [
        {
          firstName: new RegExp(search, "i"),
        },
        {
          lastName: new RegExp(search, "i"),
        },
        {
          email: new RegExp(search, "i"),
        },
        {
          userName: new RegExp(search, "i"),
        },
      ];

    const userPresent = await UserService.getUser({ ...body }, req.query);

    return OK(res, userPresent, "users fetched successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};
