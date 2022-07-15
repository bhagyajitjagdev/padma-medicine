const express = require("express");
const { auth } = require("../../../middleware/checkAuth");
const inventoryController = require("../../controllers/inventory.controller");
const v = require("../../../middleware/validators/validator");

const router = express.Router();

router.get("/", auth, inventoryController.getInventories);
router.get("/returned", auth, inventoryController.getReturnedInventories);
router.post("/", auth, v.Inventory, v.validateRequest, inventoryController.createInventory);
router.put("/:inventoryCode", auth, inventoryController.updateInventory);

module.exports = router;
