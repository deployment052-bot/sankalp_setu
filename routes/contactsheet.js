const express = require('express');
const router = express.Router();  
const { google } = require("googleapis");
// const { google } = require("googleapis");
const fs = require("fs");
const axios = require("axios");
const upload = require("../utils/volunteer_cloudanry");
// const uploadNGO = require("../utils/ngo_cloudnry");
// const uploadPdfToFolder = require("../utils/uploadPdf");
const pdfUpload = require("../utils/pdfUpload");
const uploadPdfToFolder = require("../utils/uploadPdf");
const uploadImageToCloudinary = require("../utils/ngo_cloudnry");
const { uploadToCloudinary } = require("../utils/uploadPdf");
// const contact = require('../model/contactform');
// const donet=require('../model/donet_form')
const sendEmail=require('../utils/emailSend')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const appendToSheet = async (range, values) => {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
};
const drive = google.drive({ version: "v3", auth });


async function uploadPdfToDrives(fileUrl, fileName) {
  const tempPath = `/tmp/${Date.now()}_${fileName}.pdf`;


  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
  });

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(tempPath);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  // Upload to Drive
  const driveRes = await drive.files.create({
    requestBody: { name: fileName, mimeType: "application/pdf" },
    media: { mimeType: "application/pdf", body: fs.createReadStream(tempPath) },
  });

  const fileId = driveRes.data.id;

  
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  fs.unlinkSync(tempPath);
  return `https://drive.google.com/file/d/${fileId}/view`;
}



function getFormattedDateTime() {
  const now = new Date();

  const istDateTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, 
  }).formatToParts(now);

  let dateParts = {};
  istDateTime.forEach(({ type, value }) => {
    dateParts[type] = value;
  });

  const formattedDate = `${dateParts.day}/${dateParts.month}/${dateParts.year}`;
  const formattedTime = `${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`;

  return `${formattedDate} ${formattedTime}`;
}



router.post("/contact", async (req, res) => {
  try {
    const { full_name, phone, email, resone,city, message } = req.body;


    if (!full_name || !phone || !email || !resone || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

   

  const datetime = getFormattedDateTime();
    await appendToSheet("contactform!A1:E", [
      full_name,
      email,
      phone,
      resone || "", 
      city,
      message || "", 
      datetime,
    ]);
   
    res.status(201).json({ message: "contact details saved successfully" });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed to save contact form details ", error: err.message });
  }
});



router.post(
  "/volienter-form",
  (req, res, next) => {
    // Multer middleware wrapped to catch errors
    upload.fields([
      { name: "document_front", maxCount: 1 },
      { name: "document_back", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        // Handle Multer errors here
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next(); // pass to actual handler
    });
  },
  async (req, res, next) => {
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

      if (
        !req.files?.document_front?.[0] ||
        !req.files?.document_back?.[0]
      ) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar front and back both are mandatory",
        });
      }

      const datetime = getFormattedDateTime();

      const frontUrl = req.files.document_front[0].path;
      const backUrl = req.files.document_back[0].path;

      const documentUrl =
        `=HYPERLINK("${frontUrl}","Aadhaar Front")` +
        `&CHAR(10)&` +
        `HYPERLINK("${backUrl}","Aadhaar Back")`;

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
        documentUrl,
        datetime,
      ]);

      res.status(201).json({
        success: true,
        message: "Volunteer registered successfully",
        documentUrl,
      });
    } catch (err) {
      console.error("Error:", err);
      next(err); // Pass to global error handler
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

      const datetime = getFormattedDateTime();

      // ===== Upload PDFs to Cloudinary as RAW files =====
      const regUrl = req.files?.registration_certificate
        ? await uploadToCloudinary(
            req.files.registration_certificate[0].buffer,
            "ngo_pdfs",
            `${organisation_name}_Registration`,
            "raw"
          )
        : "";

      const form80GUrl = req.files?.form_80g
        ? await uploadToCloudinary(
            req.files.form_80g[0].buffer,
            "ngo_pdfs",
            `${organisation_name}_80G`,
            "raw"
          )
        : "";

      const form12AUrl = req.files?.form_12a
        ? await uploadToCloudinary(
            req.files.form_12a[0].buffer,
            "ngo_pdfs",
            `${organisation_name}_12A`,
            "raw"
          )
        : "";

      // ===== Upload images to Cloudinary =====
      const logoUrl = req.files?.logo
        ? await uploadToCloudinary(
            req.files.logo[0].buffer,
            "ngo_logos",
            `${organisation_name}_logo`,
            "image"
          )
        : "";

      const otherImageUrl = req.files?.other_image
        ? await uploadToCloudinary(
            req.files.other_image[0].buffer,
            "ngo_images",
            `${organisation_name}_other`,
            "image"
          )
        : "";

      // ===== Append all links to Google Sheet =====
      await appendToSheet("ngo_register!A1:P", [
        datetime,
        organisation_name,
        organisation_type,
        organisation_email,
        website,
        working_area,
        mobile,
        phone,
        address,
        `=HYPERLINK("${regUrl}","Registration PDF")`,
        `=HYPERLINK("${form80GUrl}","80G PDF")`,
        `=HYPERLINK("${form12AUrl}","12A PDF")`,
        `=HYPERLINK("${logoUrl}","Logo Image")`,
        `=HYPERLINK("${otherImageUrl}","Other Image")`,
      ]);

      res.status(201).json({
        success: true,
        message: "NGO registered successfully",
        pdfLinks: { regUrl, form80GUrl, form12AUrl },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);







router.post('/request-form',async(req,res)=>{
  try{
  const{full_name,email,phone,alternate_phone,city,type_of_request,describe}=req.body;

  const datetime = getFormattedDateTime();

  await appendToSheet("requestform!A1:G",[
    full_name,
    email,
    phone,
    alternate_phone,
    city,
    type_of_request,// like food,clothes,books etc
    describe,
    datetime,
  ]);
   res.status(201).json({success:true,message:"request form submitted successfully"})

  
  }catch(err){
    console.error(err)
    res.status(500).json({success:false,message:"failed to submit request form",error:err.message})
  }
})

module.exports = router;
