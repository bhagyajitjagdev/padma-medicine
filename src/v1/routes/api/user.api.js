const express = require("express");
const { auth } = require("../../../middleware/checkAuth");
const userController = require("../../controllers/user.controller");
const v = require("../../../middleware/validators/validator");

const router = express.Router();

router.get("/", auth, userController.getUsers);
router.post("/register", v.User, v.validateRequest, userController.createUser);
router.put("/", auth, userController.updateUser);
router.post("/change-password", auth, v.ChangePassword, v.validateRequest, userController.changePassword);
router.post("/login", v.LoginUser, v.validateRequest, userController.loginUser);

module.exports = router;
