const { db } = require("../../NOSQL/database/connection");

exports.checkUser = async (email) => db.User.findOne({ email, isDeleted: false });

exports.createUser = async (body) => db.User.create(body);

exports.getUserByKey = async (body) => db.User.findOne({ ...body, isDeleted: false });

exports.getUser = async (body, { page = 1, limit = 10, order = -1 } = {}) => {
  const users = await db.User.find({ ...body, isDeleted: false })
    .sort({ createdAt: order })
    .skip(page > 0 ? (page - 1) * limit : 0)
    .limit(limit)
    .lean();

  return { totalCount: await db.User.count({ ...body, isDeleted: false }), count: users.length, rows: users };
};

exports.updateUser = async (userCode, body) => db.User.findOneAndUpdate({ userCode }, { ...body }, { new: true });
