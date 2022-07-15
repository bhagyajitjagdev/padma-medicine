const moment = require("moment");
const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");

const SaleSchema = new mongoose.Schema(
  {
    saleCode: {
      type: String,
      unique: true,
      default() {
        const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const today = `PMI${moment().utcOffset("+05:30").format("YYYYMMDDHHmmss")}`;
        const nanoid = customAlphabet(alphabet, 10);
        return today + nanoid();
      },
    },
    inventory: {
      inventoryCode: { type: String, required: true },
      batchCode: { type: String, required: true },
      medicine: {
        medicineCode: { type: String, required: true },
        name: { type: String, required: true },
      },
      boughtQuantity: { type: String, require: true },
      expireDate: { type: Date, require: true },
      price: { type: Number, require: true },
      dateOfPurchase: { type: Date, require: true },
    },
    saleQuantity: { type: Number, required: true },
    salePrice: { type: Number, require: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
