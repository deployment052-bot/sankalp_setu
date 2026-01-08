const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    image: { type: String, required: true, unique: true },
    caption: { type: String, default: "Our NGO impact" },
    source: { type: String, default: "cloudinary" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
