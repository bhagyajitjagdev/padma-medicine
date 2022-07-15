const moment = require("moment");
const { OK, ERROR } = require("../../../utils/responseHelper");
const InventoryService = require("../services/inventory.service");

exports.createInventory = async (req, res) => {
  try {
    const { batchCode, medicine, quantity, expireDate, price, dateOfPurchase } = req.body;

    const isInventoryPresent = await InventoryService.checkInventory(batchCode);

    if (isInventoryPresent) return ERROR(res, null, "This inventory already exist in the record");

    const body = {
      batchCode,
      medicine,
      boughtQuantity: quantity,
      quantity,
      expireDate,
      price,
      dateOfPurchase,
    };

    const createdInventory = await InventoryService.createInventory(body);

    return OK(res, { createdInventory }, "inventory created successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { quantity, isDeleted } = req.body;

    const body = {};

    if (quantity) body.quantity = quantity;
    if (req.body.hasOwnProperty("isDeleted")) body.isDeleted = isDeleted;

    if (!Object.keys(body).length) return ERROR(res, null, "Nothing to update");

    const inventory = await InventoryService.updateInventory(req.params.inventoryCode, body);
    return OK(res, inventory, "inventory updated successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};

exports.getInventories = async (req, res) => {
  try {
    const {
      search,
      batchCode,
      medicineCode,
      expireDateFrom,
      expireDateTo,
      dateOfPurchaseFrom,
      dateOfPurchaseTo,
      inventoryCode,
    } = req.query;

    const body = {};

    if (inventoryCode) body.inventoryCode = inventoryCode;
    if (batchCode) body.batchCode = batchCode;
    if (medicineCode) body["medicine.medicineCode"] = medicineCode;

    if (expireDateFrom && expireDateTo)
      body.expireDate = { $gte: moment(expireDateFrom).toDate(), $lte: moment(expireDateTo).toDate() };

    if (dateOfPurchaseFrom && dateOfPurchaseTo)
      body.dateOfPurchase = { $gte: moment(dateOfPurchaseFrom).toDate(), $lte: moment(dateOfPurchaseTo).toDate() };

    if (search)
      body.$or = [
        {
          batchCode: new RegExp(search, "i"),
        },
        {
          "medicine.name": new RegExp(search, "i"),
        },
      ];

    const inventoryPresent = await InventoryService.getInventories({ ...body }, req.query);

    return OK(res, inventoryPresent, "inventories fetched successfully");
  } catch (error) {
    return ERROR(res, { error }, error.message || "Something went Wrong");
  }
};
