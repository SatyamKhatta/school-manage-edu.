const express = require('express');
const router = express.Router();
const { addSchool, listSchools } = require('../controllers/schoolController');

router.post('/addschool', addSchool);
router.get('/listSchools', listSchools);

module.exports = router;
