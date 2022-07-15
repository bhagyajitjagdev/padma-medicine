const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const { randomAvatar } = require("../../v1/functions/function");

mongoose.plugin(slug);

const UserSchema = new mongoose.Schema(
  {
    userCode: { type: String, slug: ["userName"], unique: true, permanent: true },
    userName: {
      type: String,
      unique: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatarURL: {
      type: String,
      default() {
        return randomAvatar();
      },
    },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
