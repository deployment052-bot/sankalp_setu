const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("../config/r2");

const uploadToR2 = async (file, folder) => {
  const key = `${folder}/${Date.now()}_${file.originalname}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
    key,
    type: file.mimetype,
  };
};

module.exports = uploadToR2;
