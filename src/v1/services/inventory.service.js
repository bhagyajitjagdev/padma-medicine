const { db } = require("../../NOSQL/database/connection");

exports.checkInventory = async (batchCode) => db.Inventory.findOne({ batchCode, isReturned: false, isDeleted: false });

exports.createInventory = async (body) => db.Inventory.create(body);

exports.getInventoryByKey = async (body) =>
  db.Inventory.findOne({ ...body, isDeleted: false, isReturned: false, quantity: { $gt: 0 } }).lean();

exports.getInventories = async (body, { page = 1, limit = 10, order = -1 } = {}) => {
  const inventories = await db.Inventory.find({ ...body, isDeleted: false, isReturned: false, quantity: { $gt: 0 } })
    .sort({ createdAt: order })
    .skip(page > 0 ? (page - 1) * limit : 0)
    .limit(limit)
    .lean();

  return {
    totalCount: await db.Inventory.count({ ...body, isDeleted: false }),
    count: inventories.length,
    rows: inventories,
  };
};

exports.updateInventory = async (inventoryCode, body) =>
  db.Inventory.findOneAndUpdate({ inventoryCode }, { ...body }, { new: true });
