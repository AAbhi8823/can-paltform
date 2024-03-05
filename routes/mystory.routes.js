const router = require('express').Router();
const mystory_controller = require('../controllers/mystory.controllers');

//Routes
router.post('/add-story', mystory_controller.add_mystory);
router.get('/get-story-list', mystory_controller.get_mystory_list);



module.exports = router;