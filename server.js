require("dotenv").config(); 

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
// app.use('/media', require('./routes/media'));
app.use('/newsletter',require('./routes/newslatter'))
app.use('/donation',require('./routes/donation_route'))
app.use("/receipts", express.static("receipts"));
app.use("/certificates", express.static("certificates"));

require('./cron/story.cron');  
require('./cron/instagramReel.cron'); 

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');

    console.log(
      "CLOUDINARY ENV →",
      process.env.CLOUD_NAME,
      process.env.CLOUD_API_KEY ? "KEY_LOADED" : "KEY_MISSING"
    );

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
