const express = require("express");

const router = express.Router();

const apiUser = require("./api/user.api");
const apiMedicine = require("./api/medicine.api");
const apiInventory = require("./api/inventory.api");
const apiSale = require("./api/sale.api");

router.use("/user", apiUser);
router.use("/medicine", apiMedicine);
router.use("/inventory", apiInventory);
router.use("/sale", apiSale);

module.exports = router;
