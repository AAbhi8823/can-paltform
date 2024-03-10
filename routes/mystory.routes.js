const router = require('express').Router();
const mystory_controller = require('../controllers/mystory.controllers');

//Routes
router.post('/add-story', mystory_controller.add_mystory);
router.get('/get-story-list', mystory_controller.get_mystory_list);
router.get('/get-my-story-list', mystory_controller.get_my_story_list);



module.exports = router;