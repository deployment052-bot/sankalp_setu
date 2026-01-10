const { google } = require("googleapis");
const { Readable } = require("stream");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadPdfToFolder(fileData, fileName, folderId) {
  let mediaBody;
  if (Buffer.isBuffer(fileData)) {
    mediaBody = Readable.from(fileData);
  } else if (typeof fileData === "string") {
    mediaBody = fs.createReadStream(fileData);
  } else {
    throw new Error("Invalid fileData type. Must be string path or Buffer.");
  }

  const fileMetadata = {
    name: `${fileName}.pdf`,
    parents: [folderId],
  };

  const media = {
    mimeType: "application/pdf",
    body: mediaBody,
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  return response.data.webViewLink;
}


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


async function uploadToCloudinary(fileBuffer, folder, fileName, resourceType = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: fileName, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = {
  uploadPdfToFolder,     
  uploadToCloudinary,    
};
