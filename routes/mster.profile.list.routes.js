const router=require('express').Router();

const masterProfileListController = require('../controllers/master.profile.list.controllers');

// Master Profile List routes
router.post('/add-profile-list', masterProfileListController.add_master_profile_list);
router.get('/get-profile-list', masterProfileListController.get_master_profile_list);
// router.put('/update', masterProfileListController.updateMasterProfileList);

module.exports = router;
