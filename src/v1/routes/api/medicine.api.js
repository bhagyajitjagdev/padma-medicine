const express = require("express");
const { auth } = require("../../../middleware/checkAuth");
const medicineController = require("../../controllers/medicine.controller");
const v = require("../../../middleware/validators/validator");

const router = express.Router();

router.get("/", auth, medicineController.getMedicines);
router.post("/", auth, v.Medicine, v.validateRequest, medicineController.createMedicine);
router.put("/:medicineCode", auth, medicineController.updateMedicine);

module.exports = router;
