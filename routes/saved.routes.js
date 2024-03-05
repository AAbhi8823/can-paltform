const router = require('express').Router();

const saved_mystory_controller = require('../controllers/saved.mystory.controllers');

//Routes
router.post('/save-story', saved_mystory_controller.save_mystory);

module.exports = router;
