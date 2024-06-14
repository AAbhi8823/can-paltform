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

const zoom_controller = require('../controllers/zoom.controllers')



//Routes
//router.post('/create-meeting', zoom_meeting_controller.createZoomMeeting);
//router.get('/zoomuserinfo', addToken, zoomuserInfo);
//router.get('/get-meeting', addToken, getMeeting);
// router.put('/meeting', addToken, updateMeeting);
// router.delete('/meeting', addToken, deleteMeeting);

router.post('/add-meeting', zoom_controller.create_meeting)
router.get("/get-meeting-list", zoom_controller.get_meetings_list)
router.delete("/delete-meeting/:meeting_id", zoom_controller.delete_meeting_by_id)
router.get("/get-meeting-by-filter/:filter", zoom_controller.get_meetings_by_filter)




//test routes
//router.post("/create-meeting", zoom_controller.create_meeting);
// router.post('/oauth-meeting', zoom_controller.auth_meeting);

module.exports=router;