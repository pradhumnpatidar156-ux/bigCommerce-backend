const axios = require('axios');

const STORE_HASH = process.env.BC_STORE_HASH;
const ACCESS_TOKEN = process.env.BC_ACCESS_TOKEN;

if (!STORE_HASH || !ACCESS_TOKEN) {
  // Do not throw here so app can still start in other environments, but warn
  console.warn('BC_STORE_HASH or BC_ACCESS_TOKEN is not set in environment variables');
}

function buildUrl(path) {
  return `https://api.bigcommerce.com/stores/${STORE_HASH}${path}`;
}

async function fetchProductsByCategory(categoryId) {
  if (!STORE_HASH || !ACCESS_TOKEN) {
    throw new Error('BigCommerce store hash or access token not configured');
  }

  const url = buildUrl(`/v3/catalog/products?categories:in=${categoryId}&include=images`);

  const resp = await axios.get(url, {
    headers: {
      'X-Auth-Token': ACCESS_TOKEN,
      'Accept': 'application/json'
    }
  });

  return resp.data;
}

module.exports = {
  fetchProductsByCategory
};
