const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
// Best Seller category (ID: 85)
router.get('/best-seller', async (req, res) => {
	// reuse controller with categoryId param
	req.params.categoryId = '85';
	return productsController.getProductsByCategory(req, res);
});

// Best Value category (ID: 84)
router.get('/best-value', async (req, res) => {
	req.params.categoryId = '84';
	return productsController.getProductsByCategory(req, res);
});
module.exports = router;