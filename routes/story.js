const router = require("express").Router();
const Story = require("../model/story");


router.get("/stories", async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      stories,
    });
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
