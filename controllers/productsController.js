const bigCommerceService = require('../services/bigCommerceService');

function pickImage(product) {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0].url_zoom || product.images[0].url_standard || product.images[0].url_thumbnail || product.images[0].image_url || null;
  }
  return null;
}

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price !== undefined ? Number(p.price) : null,
    inventory_level: p.inventory_level !== undefined ? p.inventory_level : null,
    url: p.custom_url && p.custom_url.url ? p.custom_url.url : p.url || null,
    image: pickImage(p)
  };
}

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const data = await bigCommerceService.fetchProductsByCategory(categoryId);
    const products = data.data || [];

    const filtered = products.filter(p => p.is_visible === true && (p.inventory_level > 0));
    const mapped = filtered.map(mapProduct);

    return res.json(mapped);
  } catch (error) {
    console.error('Error fetching products:', error.message || error);
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data || error.message || 'Failed to fetch products';
    return res.status(status).json({ error: message });
  }
};
