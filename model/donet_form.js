const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  amount: Number,

  razorpayOrderId: String,
  razorpayPaymentId: String,

  receiptPath: String,
  certificatePath: String,

  donatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
