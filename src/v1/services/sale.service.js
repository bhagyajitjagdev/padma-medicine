const { db } = require("../../NOSQL/database/connection");

exports.checkSale = async (saleCode) => db.Sale.findOne({ saleCode, isDeleted: false });

exports.createSale = async (body) => db.Sale.create(body);

exports.getSaleByKey = async (body) => db.Sale.findOne({ ...body, isDeleted: false });

exports.getSale = async (body, { page = 1, limit = 10, order = -1 } = {}) => {
  const sales = await db.Sale.find({ ...body, isDeleted: false })
    .sort({ createdAt: order })
    .skip(page > 0 ? (page - 1) * limit : 0)
    .limit(limit)
    .lean();

  return {
    totalCount: await db.Sale.count({ ...body, isDeleted: false }),
    count: sales.length,
    rows: sales,
  };
};

exports.updateSale = async (saleCode, body) => db.Sale.findOneAndUpdate({ saleCode }, { ...body }, { new: true });
