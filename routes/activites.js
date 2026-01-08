const express=require('express')
const Activities=require('../model/Activities')
const router=express.Router();



function getFormattedDateTime() {
  const now = new Date();

  const istDateTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, 
  }).formatToParts(now);

  let dateParts = {};
  istDateTime.forEach(({ type, value }) => {
    dateParts[type] = value;
  });
}
function formatDateDDMMYYYY(date) {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

router.post('/add-event',async(req,res)=>{
    try{
        const {nameofevent,when,Place,title,description_of_event, eventDateTime}=req.body;
            const datetime = getFormattedDateTime();

            if(!nameofevent || !Place  || !title ||!description_of_event){
                return res.status(400).json({
                        success:false
                })
            }

           const event= await Activities.create({
            nameofevent,
            Place,
            title,
            description_of_event,
             eventDateTime: new Date(eventDateTime)
           })
          res.status(200).json({
            success:true,
            event,
          })
    }catch(err){
         console.error("Error:", err);
      res.status(500).json({
        message: "Failed to save event form details",
        error: err.message,
      });
    }
})


router.get('/getevent', async (req, res) => {
  try {
    const now = new Date();

    const events = await Activities.find({
      eventDateTime: { $gte: now }
    })
      .sort({ eventDateTime: 1 })
      .select('nameofevent Place title description_of_event eventDateTime');

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No upcoming events found'
      });
    }

    
    const formattedEvents = events.map(event => ({
      _id: event._id,
      nameofevent: event.nameofevent,
      Place: event.Place,
      title: event.title,
      description_of_event: event.description_of_event,
      eventDate: formatDateDDMMYYYY(event.eventDateTime)
    }));

    res.status(200).json({
      success: true,
      eventlength: formattedEvents.length,
      eventdetails: formattedEvents
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: err.message
    });
  }
});


router.get('/recent-event', async (req, res) => {
  try {
    const now = new Date();

    const recentEvents = await Activities.find({
      eventDateTime: { $lt: now }
    }).sort({ eventDateTime: -1 });

    res.status(200).json({
      success: true,
      eventlength: recentEvents.length,
      recentEvents
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent events",
      error: err.message
    });
  }
});

module.exports = router; 