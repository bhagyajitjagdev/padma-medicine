const Bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const { BAD, ERROR } = require("../../../utils/responseHelper");
const UserService = require("../../v1/services/user.service");
const InventoryService = require("../../v1/services/inventory.service");

// eslint-disable-next-line consistent-return
exports.validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return BAD(
        res,
        errors.array().map((e) =>
          process.env.NODE_ENV.trim() === "production"
            ? {
                msg: e.msg,
                param: e.param,
              }
            : { ...e }
        ),
        validationResult(req)
          .array()
          .map((e) => e.msg)
          .join()
      );
    }
    next();
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.LoginUser = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("valid Email is required"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
];

exports.User = [
  check("firstName").trim().not().isEmpty().withMessage("firstName is required"),
  check("lastName").trim().not().isEmpty().withMessage("lastName is required"),
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("valid Email is required"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
];

exports.ChangePassword = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("valid Email is required"),
  check("oldPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("oldPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("oldPassword should be at least 6 character long")
    .bail()
    .custom(async (value, { req }) => {
      const { email, password } = req.body;

      if (value === password) throw new Error("you cant make your new password same as old password");

      const userPresent = await UserService.checkUser(email);

      const hashedPassword = await Bcryptjs.compare(value, userPresent.password);

      if (!hashedPassword) throw new Error("invalid old password");

      return true;
    }),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password should be at least 6 character long"),
  check("confirmPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("confirmPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("confirmPassword should be at least 6 character long")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password didn't match with confirmPassword");
      }
      return true;
    }),
];

exports.Medicine = [check("name").trim().not().isEmpty().withMessage("name is required")];

exports.Inventory = [
  check("batchCode").trim().not().isEmpty().withMessage("batchCode is required"),
  check("medicine.name").trim().not().isEmpty().withMessage("medicine name is required"),
  check("medicine.medicineCode").trim().not().isEmpty().withMessage("medicineCode is required"),
  check("quantity").isNumeric().not().isEmpty().withMessage("quantity is required"),
  check("expireDate").isDate().not().isEmpty().withMessage("expireDate is required"),
  check("price").isNumeric().not().isEmpty().withMessage("price is required"),
  check("dateOfPurchase").isDate().not().isEmpty().withMessage("dateOfPurchase is required"),
];

exports.Sale = [
  check("saleQuantity").isNumeric().not().isEmpty().withMessage("saleQuantity is required"),
  check("salePrice").isNumeric().not().isEmpty().withMessage("salePrice is required"),
  check("inventoryCode")
    .not()
    .isEmpty()
    .withMessage("inventoryCode is required")
    .custom(async (value, { req }) => {
      const inventoryPresent = await InventoryService.getInventoryByKey({ inventoryCode: value });

      if (!inventoryPresent) throw new Error("invalid inventoryCode");

      req.body.inventory = inventoryPresent;

      return true;
    }),
];
