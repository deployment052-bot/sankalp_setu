const router = require("express").Router();
const Media = require("../model/media");
const { upload, uploadToCloudinary } = require("../utils/mediaUpload");


 
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file, "ngo-gallery");

    const media = await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
      
      title: req.body.title || "",
    });

    res.status(201).json({
      success: true,
      media,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
});


router.get("/all", async (req, res) => {
  try {
    const media = await Media.find().sort({ uploadedAt: -1 });

    res.json({
      success: true,
      total: media.length,
      media,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch media",
    });
  }
});

module.exports = router;
