require("dotenv").config();   // ✅ ONLY ONCE, AT TOP

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/form', require('./routes/contactsheet'));
app.use('/story', require('./routes/story'));
app.use('/activity', require('./routes/activites'));
app.use('/media', require('./routes/media'));

require('./cron/story.cron');  
require('./cron/instagramReel.cron'); 

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');

    // 🔥 ADD THIS DEBUG LINE (TEMPORARY)
    console.log(
      "CLOUDINARY ENV →",
      process.env.CLOUD_NAME,
      process.env.CLOUD_API_KEY ? "KEY_LOADED" : "KEY_MISSING"
    );

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
