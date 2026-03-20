const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("../config/R2");
const path = require("path");

const uploadToR2 = async (file) => {
  
  const folder = file.mimetype.startsWith("image")
    ? "images"
    : "documents";

  const ext = path.extname(file.originalname);
  const safeName = file.originalname.replace(/\s+/g, "-");

  const fileKey = `${folder}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  return {
    url: `${process.env.R2_PUBLIC_URL}/${fileKey}`,
    key: fileKey,
    type: file.mimetype.split("/")[0], 
  };
};

module.exports = uploadToR2;
