// cron/story.cron.js
const cron = require("node-cron");
const cloudinary = require("../config/cloudinary");
const Story = require("../models/Story");
const { isValidStory } = require("../utils/story.rules");

cron.schedule("0 */6 * * *", async () => {
  console.log("🔄 Story cron running...");

  const result = await cloudinary.search
    .expression("folder:ngo-stories")
    .sort_by("created_at", "desc")
    .max_results(20)
    .execute();

  for (const asset of result.resources) {
    const exists = await Story.findOne({ image: asset.secure_url });
    if (exists) continue;

    if (!isValidStory(asset)) continue;

    await Story.create({
      image: asset.secure_url,
      caption: "Our NGO impact",
      source: "cloudinary",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    });
  }

  console.log("✅ Story cron completed");
});
