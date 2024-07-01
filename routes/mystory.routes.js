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
router.get('/most-liked-story', mystory_controller.most_liked_story);
router.delete('/delete-story/:story_id', mystory_controller.delete_story);
router.get('/get-story-by-filter/:filter', mystory_controller.get_story_by_filter)

//get story by id
router.get('/get-single-story/:story_id', mystory_controller.get_story_by_id);


// SAVE STORY ROUTES
const saved_mystory_controller = require('../controllers/saved.mystory.controllers');

//Routes
router.post('/add-save-story', saved_mystory_controller.save_mystory);
//router.post('/unsave-story', saved_mystory_controller.unsave_mystory);
router.get('/get-saved-stories', saved_mystory_controller.get_saved_mystories);
router.get('/get-saved-story/:saved_story_id', saved_mystory_controller.get_saved_mystory_by_id);

router.delete("/delete-story/:story_id", mystory_controller.delete_story);

//Admin Dashboard Routes
router.get('/get-total-stories', mystory_controller.get_total_active_mystory);










module.exports = router;