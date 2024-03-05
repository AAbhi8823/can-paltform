const router = require('express').Router();

// const {
//     zoomuserInfo,
//     createZoomMeeting,
//     getMeeting,
//     updateMeeting,
//     deleteMeeting,
//     } = require('../controllers/zoom.live.meeting.management.controllers');

//const { addToken } = require('../middlewares/zoom.auth');
//const zoom_meeting_controller = require('../Zoom/zoom.live.meeting.management.controllers');
//const zoom_controller = require('../Zoom/zoom.live.meeting.management.controllers');

const zoom_controller = require('../helpers/zoom.integration')



//Routes
//router.post('/create-meeting', zoom_meeting_controller.createZoomMeeting);
//router.get('/zoomuserinfo', addToken, zoomuserInfo);
//router.get('/get-meeting', addToken, getMeeting);
// router.put('/meeting', addToken, updateMeeting);
// router.delete('/meeting', addToken, deleteMeeting);



//test routes
router.post("/add-meeting", zoom_controller.add_meeting);
// router.post('/oauth-meeting', zoom_controller.auth_meeting);

module.exports=router;