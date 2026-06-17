const axios = require('axios');
const tokenManager = require('./tokenManager');

const createHummHeaders = token => ({
  Accept: 'application/json; charset=UTF-8',
  'Content-Type': 'application/json; charset=UTF-8',
  Authorization: `Bearer ${token}`
});

async function makeHummApiCall(method, url, data = null) {
  let accessToken = await tokenManager.getAccessToken();

  const makeRequest = async () => {
    const config = {
      method,
      url,
      headers: createHummHeaders(accessToken),
      data
    };
    return axios(config);
  };

  try {
    return await makeRequest();
  } catch (error) {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      tokenManager.clearToken();
      accessToken = await tokenManager.getAccessToken(true);
      return await makeRequest();
    }
    throw error;
  }
}

async function initiatePayment(orderData) {
  const hummAccountId = process.env.HUMM_ACCOUNT_ID;
  const storeUrl = process.env.YOUR_STORE_URL;

  if (!hummAccountId || !storeUrl) {
    throw new Error('HUMM_ACCOUNT_ID and YOUR_STORE_URL must be configured');
  }

  const token = await tokenManager.getAccessToken();
  const baseUrl = tokenManager.instanceUrl;
  if (!baseUrl) {
    throw new Error('Salesforce instance URL is unavailable');
  }

  const url = `${baseUrl}/services/apexrest/initiateProcess`;
  const payload = {
    accountId: hummAccountId,
    checkout_returnURL: `${storeUrl.replace(/\/$/, '')}/humm/callback`,
    customerInfo: {
      name: orderData.customerName,
      email: orderData.customerEmail,
      mobileNumber: orderData.mobileNumber
    },
    orderDetails: {
      orderInvoiceID: orderData.orderId,
      orderDescription: orderData.description,
      orderInvoiceAmt: orderData.totalAmount,
      orderDate: orderData.orderDate
    }
  };

  const response = await makeHummApiCall('post', url, payload);
  return response.data;
}

async function getPaymentDetails(trackingId, accountId) {
  const token = await tokenManager.getAccessToken();
  const baseUrl = tokenManager.instanceUrl;
  if (!baseUrl) {
    throw new Error('Salesforce instance URL is unavailable');
  }

  const url = `${baseUrl}/services/apexrest/getPaymentDetails`;
  const payload = {
    trackingId,
    accountId
  };

  const response = await makeHummApiCall('post', url, payload);
  return response.data;
}

async function refundPayment(trackingId, accountId) {
  const token = await tokenManager.getAccessToken();
  const baseUrl = tokenManager.instanceUrl;
  if (!baseUrl) {
    throw new Error('Salesforce instance URL is unavailable');
  }

  const url = `${baseUrl}/services/apexrest/RefundPayment`;
  const payload = {
    trackingId,
    accountId
  };

  const response = await makeHummApiCall('post', url, payload);
  return response.data;
}

module.exports = {
  initiatePayment,
  getPaymentDetails,
  refundPayment
};
