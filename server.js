const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/form', require('./routes/contactsheet'));

app.use('/story',require('./routes/story'));
app.use('/activity',require('./routes/activites'));
app.use('/media',require('./routes/media'))

require('./cron/story.cron');  
require('./cron/instagramReel.cron'); 

// if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log('MongoDB connected');

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
// }

