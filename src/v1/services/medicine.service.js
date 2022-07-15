const { db } = require("../../NOSQL/database/connection");

exports.checkMedicine = async (name) => db.Medicine.findOne({ name, isDeleted: false });

exports.createMedicine = async (body) => db.Medicine.create(body);

exports.getMedicineByKey = async (body) => db.Medicine.findOne({ ...body, isDeleted: false });

exports.getMedicine = async (body, { page = 1, limit = 10, order = -1 } = {}) => {
  const medicines = await db.Medicine.find({ ...body, isDeleted: false })
    .sort({ name: 1, createdAt: order })
    .skip(page > 0 ? (page - 1) * limit : 0)
    .limit(limit)
    .lean();

  return {
    totalCount: await db.Medicine.count({ ...body, isDeleted: false }),
    count: medicines.length,
    rows: medicines,
  };
};

exports.updateMedicine = async (medicineCode, body) =>
  db.Medicine.findOneAndUpdate({ medicineCode }, { ...body }, { new: true });
