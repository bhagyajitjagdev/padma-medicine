const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const InventorySchema = new mongoose.Schema(
  {
    inventoryCode: { type: String, slug: ["batchCode"], unique: true, permanent: true },
    batchCode: { type: String, required: true },
    medicine: {
      medicineCode: { type: String, required: true },
      name: { type: String, required: true },
    },
    boughtQuantity: { type: Number, require: true },
    quantity: { type: Number, required: true },
    expireDate: { type: Date, require: true },
    price: { type: Number, require: true },
    dateOfPurchase: { type: Date, require: true },
    isReturned: { type: Boolean, default: false },
    returnedOn: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);
