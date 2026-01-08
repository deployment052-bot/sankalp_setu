const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["image", "video"], 
    required: true 
  },
  title: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Media", mediaSchema);
