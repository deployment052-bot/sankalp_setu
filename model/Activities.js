const mongoose = require('mongoose');

const ActivitiesSchema = new mongoose.Schema({
  nameofevent: {
    type: String,
    required: true
  },
  Place: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description_of_event: {
    type: String,
    required: true
  },
  eventDateTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('activities', ActivitiesSchema);
