const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const fs = require("fs");
const axios = require("axios");

const uploadVolunteer = require("../utils/volunteer_cloudanry");
const pdfUpload = require("../utils/pdfUpload");
const { uploadToCloudinary } = require("../utils/uploadPdf");
const sendEmail = require("../utils/emailSend");


const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const appendToSheet = async (range, values) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
};

/* ================= DATE TIME ================= */

const getFormattedDateTime = () => {
  const now = new Date();
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "short",
    timeStyle: "medium",
    hour12: true,
  }).format(now);
};



router.post("/contact", async (req, res) => {
  try {
    const { full_name, phone, email, resone, city, message } = req.body;

    if (!full_name || !phone || !email || !resone || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await appendToSheet("contactform!A1:G", [
      full_name,
      email,
      phone,
      resone,
      city,
      message || "",
      getFormattedDateTime(),
    ]);

    res.json({ success: true, message: "Contact saved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post(
  "/volienter-form",
  uploadVolunteer.fields([
    { name: "document_front", maxCount: 1 },
    { name: "document_back", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        full_name,
        phone,
        email,
        age,
        address,
        gender,
        skill,
        availability,
        interest,
        skill_note,
      } = req.body;

      if (!req.files?.document_front || !req.files?.document_back) {
        return res.status(400).json({ message: "Aadhaar front & back required" });
      }

      const frontUrl = req.files.document_front[0].path;
      const backUrl = req.files.document_back[0].path;

      const docLinks = `=HYPERLINK("${frontUrl}","Front") & CHAR(10) & HYPERLINK("${backUrl}","Back")`;

      await appendToSheet("volunteerform!A1:L", [
        full_name,
        email,
        phone,
        age,
        address,
        gender,
        skill,
        availability,
        interest,
        skill_note,
        docLinks,
        getFormattedDateTime(),
      ]);

      res.json({ success: true, message: "Volunteer registered" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);


router.post(
  "/ngo-register",
  pdfUpload.fields([
    { name: "registration_certificate", maxCount: 1 },
    { name: "form_80g", maxCount: 1 },
    { name: "form_12a", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "other_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        organisation_name,
        organisation_type,
        organisation_email,
        website,
        working_area,
        mobile,
        phone,
        address,
      } = req.body;

      const upload = async (file, folder, type = "raw") =>
        file
          ? uploadToCloudinary(file.buffer, folder, `${organisation_name}_${Date.now()}`, type)
          : "";

      const regUrl = await upload(req.files?.registration_certificate?.[0], "ngo_pdfs");
      const form80GUrl = await upload(req.files?.form_80g?.[0], "ngo_pdfs");
      const form12AUrl = await upload(req.files?.form_12a?.[0], "ngo_pdfs");
      const logoUrl = await upload(req.files?.logo?.[0], "ngo_images", "image");
      const otherImageUrl = await upload(req.files?.other_image?.[0], "ngo_images", "image");

      await appendToSheet("ngo_register!A1:P", [
        getFormattedDateTime(),
        organisation_name,
        organisation_type,
        organisation_email,
        website,
        working_area,
        mobile,
        phone,
        address,
        `=HYPERLINK("${regUrl}","Registration")`,
        `=HYPERLINK("${form80GUrl}","80G")`,
        `=HYPERLINK("${form12AUrl}","12A")`,
        `=HYPERLINK("${logoUrl}","Logo")`,
        `=HYPERLINK("${otherImageUrl}","Other Image")`,
      ]);

      res.json({ success: true, message: "NGO registered successfully" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);



router.post("/request-form", async (req, res) => {
  try {
    const { full_name, email, phone, alternate_phone, city, type_of_request, describe } = req.body;

    await appendToSheet("requestform!A1:H", [
      full_name,
      email,
      phone,
      alternate_phone,
      city,
      type_of_request,
      describe,
      getFormattedDateTime(),
    ]);

    res.json({ success: true, message: "Request submitted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
