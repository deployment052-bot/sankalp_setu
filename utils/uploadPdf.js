const { google } = require("googleapis");
const { Readable } = require("stream");
const fs = require("fs");

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
    supportsAllDrives: true, // required for Shared Drives
  });

  return response.data.webViewLink;
}


module.exports = uploadPdfToFolder;
