const express = require("express");
const { auth } = require("../../../middleware/checkAuth");
const saleController = require("../../controllers/sale.controller");
const v = require("../../../middleware/validators/validator");

const router = express.Router();

router.get("/", auth, saleController.getSales);
router.post("/", auth, v.Sale, v.validateRequest, saleController.createSale);
router.put("/:saleCode", auth, saleController.updateSale);

module.exports = router;
