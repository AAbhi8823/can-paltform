const router = require('express').Router();
const mystory_controller = require('../controllers/mystory.controllers');

//Routes
router.post('/add-story', mystory_controller.add_mystory);
router.get('/get-story-list', mystory_controller.get_mystory_list);
router.get('/get-my-story-list', mystory_controller.get_my_story_list);

//add like to story rpoute
router.post('/like-story', mystory_controller.like_story);
//get likes of a story API
router.get('/get-likes-list', mystory_controller.get_likes);




const saved_mystory_controller = require('../controllers/saved.mystory.controllers');

//Routes
router.post('/add-save-story', saved_mystory_controller.save_mystory);
router.post('/unsave-story', saved_mystory_controller.unsave_mystory);
router.get('/get-saved-stories', saved_mystory_controller.get_saved_mystories);





module.exports = router;