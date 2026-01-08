const cron = require("node-cron");
const Story = require("../model/story");
const { fetchInstagramReels } = require("../utils/instagram.api");

cron.schedule("0 */3 * * *", async () => {
  console.log("Instagram Reel cron running...");

  try {
    const mediaList = await fetchInstagramReels();

    for (const media of mediaList) {
      if (media.media_type !== "VIDEO") continue;

      const exists = await Story.findOne({ image: media.media_url });
      if (exists) continue;

      await Story.create({
        image: media.media_url,
        caption: media.caption || "Instagram Reel",
        source: "instagram",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    console.log(" Instagram Reel cron completed");
  } catch (err) {
    console.error(" Instagram cron error:", err.message);
  }
});
