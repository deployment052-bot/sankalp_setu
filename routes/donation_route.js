require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Donation = require("../model/donet_form");
const generateReceipt = require("../utils/donation/generateReceipt");
const generateCertificate = require("../utils/donation/generateCertificate");

const router = express.Router();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


router.post("/create-order", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: "don_" + Date.now()
    });


    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error("Razorpay create-order error:", err);

    res.status(500).json({
      error: "Order creation failed",
      details: err.error || err.message
    });
  }
});


router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donor
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

   
    const donation = await Donation.create({
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      amount: Number(donor.amount),

      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

   donation.receiptPath = await generateReceipt(donation);
donation.certificatePath = await generateCertificate(donation);

await donation.save();


    await donation.save();

    res.json({
      success: true,
      message: "Donation successful",
      receipt: donation.receiptPath,
      certificate: donation.certificatePath
    });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

router.post("/mock-payment", async (req, res) => {
  try {
    const donor = req.body.donor;

    const donation = await Donation.create({
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      amount: donor.amount,
      razorpayOrderId: "MOCK_ORDER",
      razorpayPaymentId: "MOCK_PAYMENT"
    });

    donation.receiptPath = await generateReceipt(donation);
    donation.certificatePath = await generateCertificate(donation);

    console.log("Receipt Path:", donation.receiptPath);
    console.log("Certificate Path:", donation.certificatePath);

    await donation.save();

    res.json({
      success: true,
      receiptUrl: `${req.protocol}://${req.get("host")}/${donation.receiptPath}`,
      certificateUrl: `${req.protocol}://${req.get("host")}/${donation.certificatePath}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
