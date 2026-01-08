const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/CloudinaryConfig");

const volunteerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "volunteer_documents_for_person",
    resource_type: "auto",
  },
});

const uploadVolunteer = multer({
  storage: volunteerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG or PDF allowed"));
    }
    cb(null, true);
  },
});

module.exports = uploadVolunteer;
