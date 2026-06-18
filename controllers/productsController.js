const bigCommerceService = require('../services/bigCommerceService');

function pickImage(product) {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null;
  }

  // Strategy 1: Find image marked as thumbnail (primary display image)
  let selectedImage = product.images.find(img => img.is_thumbnail === true);
  
  // Strategy 2: Find image with sort_order = 0 (first in display order)
  if (!selectedImage) {
    selectedImage = product.images.find(img => img.sort_order === 0);
  }
  
  // Strategy 3: Use first image as fallback
  if (!selectedImage) {
    selectedImage = product.images[0];
  }

  // Debug logging: log which strategy was used and the image details
  if (process.env.DEBUG_IMAGES === 'true') {
    console.log(`[Product ${product.id}] Selected image:`, {
      is_thumbnail: selectedImage.is_thumbnail,
      sort_order: selectedImage.sort_order,
      url_standard: selectedImage.url_standard ? 'available' : 'N/A',
      url_zoom: selectedImage.url_zoom ? 'available' : 'N/A'
    });
  }

  // Return the best quality URL for storefront display
  return selectedImage.url_standard || selectedImage.url_zoom || selectedImage.url_thumbnail || selectedImage.image_url || null;
}

function mapProduct(p) {
  return {
    id: p.id,
    sku: p.sku || null,
    name: p.name,
    price: p.price !== undefined ? Number(p.price) : null,
    sale_price: p.sale_price !== undefined ? Number(p.sale_price) : null,
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
    const mapped = filtered.map(mapProduct).slice(0, 6);

    return res.json(mapped);
  } catch (error) {
    console.error('Error fetching products:', error.message || error);
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data || error.message || 'Failed to fetch products';
    return res.status(status).json({ error: message });
  }
};
