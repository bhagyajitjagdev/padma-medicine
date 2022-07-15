const moment = require("moment");
const { OK, ERROR } = require("../../../utils/responseHelper");
const SaleService = require("../services/sale.service");
const InventoryService = require("../services/inventory.service");

exports.createSale = async (req, res) => {
  try {
    const { saleQuantity, salePrice, inventory, inventoryCode } = req.body; // inventory is coming from the validator

    const body = {
      saleQuantity,
      salePrice,
      inventory,
    };

    const createdSale = await SaleService.createSale(body);
    await InventoryService.updateInventory(inventoryCode, { quantity: inventory.quantity - saleQuantity });

    return OK(res, { createdSale }, "sale created successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { isDeleted } = req.body;

    const body = {};

    if (req.body.hasOwnProperty("isDeleted")) body.isDeleted = isDeleted;

    if (!Object.keys(body).length) return ERROR(res, null, "Nothing to update");

    const sale = await SaleService.updateSale(req.params.saleCode, body);
    return OK(res, sale, "sale updated successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.getSales = async (req, res) => {
  try {
    const { search, saleCode, inventoryCode, batchCode, medicineCode, soldFrom, soldTo } = req.query;

    const body = {};

    if (saleCode) body.saleCode = saleCode;
    if (inventoryCode) body["inventory.inventoryCode"] = inventoryCode;
    if (batchCode) body["inventory.batchCode"] = batchCode;
    if (medicineCode) body["inventory.medicine.medicineCode"] = medicineCode;

    if (soldFrom && soldTo) body.createdAt = { $gte: moment(soldFrom).toDate(), $lte: moment(soldTo).toDate() };

    if (search)
      body.$or = [
        {
          saleCode: new RegExp(search, "i"),
        },
        {
          "inventory.inventoryCode": new RegExp(search, "i"),
        },
        {
          "inventory.batchCode": new RegExp(search, "i"),
        },
        {
          "inventory.medicine.name": new RegExp(search, "i"),
        },
      ];

    const salePresent = await SaleService.getSale({ ...body }, req.query);

    return OK(res, salePresent, "sales fetched successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};
