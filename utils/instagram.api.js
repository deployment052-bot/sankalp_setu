const axios = require("axios");
const Story = require("../model/story");

const fetchInstagramReels = async () => {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    console.log("Instagram env missing");
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,media_type,media_url,caption,timestamp&access_token=${ACCESS_TOKEN}`;

  const res = await axios.get(url);

  for (const media of res.data.data) {
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

  console.log(" Instagram reels synced");
};

module.exports = { fetchInstagramReels };
