const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const MedicineSchema = new mongoose.Schema(
  {
    medicineCode: { type: String, slug: ["name"], unique: true, permanent: true },
    name: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", MedicineSchema);
