const multer = require("multer");
const cloudinary = require("../config/CloudinaryConfig");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video")
      ? "video"
      : "image";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

module.exports = { upload, uploadToCloudinary };
