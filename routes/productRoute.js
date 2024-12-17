const express = require('express');
const checkAuth  = require('../middleware/auth')
const router = express.Router();
const { allCategories } = require('../controllers/productController');

router.get('/categories', checkAuth, allCategories)

module.exports = router;