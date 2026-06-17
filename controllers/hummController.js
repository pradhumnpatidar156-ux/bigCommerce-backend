const hummService = require('../services/hummService');

const hummErrorCodes = {
  'FF-SC-01': 'REQUIRED_FIELD_MISSING',
  'FF-SC-02': 'INCORRECT_FORMAT',
  'FF-SC-03': 'INCORRECT_ACCOUNTID',
  'FF-SC-05': 'INVALID_MOBILE_NUMBER',
  'FF-SC-06': 'INCORRECT_TRACKING_ID',
  'FF-SC-07': 'COMMUNITY_NOT_FOUND'
};

function mapHummError(error) {
  if (!error || !error.response || !error.response.data) {
    return null;
  }

  const data = error.response.data;
  if (data.error && hummErrorCodes[data.error]) {
    return hummErrorCodes[data.error];
  }

  if (data.code && hummErrorCodes[data.code]) {
    return hummErrorCodes[data.code];
  }

  return null;
}

exports.initiatePayment = async (req, res) => {
  try {
    const { customerName, customerEmail, mobileNumber, orderId, description, totalAmount } = req.body;

    if (!customerName || !customerEmail || !mobileNumber || !orderId || !description || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields for payment initiation' });
    }

    const mobileDigits = String(mobileNumber).replace(/\D/g, '');
    if (mobileDigits.length !== 10) {
      return res.status(400).json({ error: 'mobileNumber must be exactly 10 digits' });
    }

    const orderData = {
      customerName,
      customerEmail,
      mobileNumber: mobileDigits,
      orderId,
      description,
      totalAmount,
      orderDate: new Date().toISOString().split('T')[0]
    };

    const paymentResponse = await hummService.initiatePayment(orderData);
    const redirectURL = paymentResponse.redirectURL || paymentResponse.redirectUrl || paymentResponse.redirect_uri;
    const trackingId = paymentResponse.trackingId || paymentResponse.trackingID || paymentResponse.trackingid;

    if (!redirectURL || !trackingId) {
      return res.status(500).json({ error: 'Humm API did not return redirectURL or trackingId' });
    }

    return res.json({ redirectURL, trackingId });
  } catch (error) {
    console.error('Error initiating Humm payment:', error.message || error);
    const hummError = mapHummError(error);
    const status = error.response ? error.response.status : 500;
    const message = hummError || error.response?.data?.message || 'Failed to initiate payment';
    return res.status(status === 401 ? 401 : 500).json({ error: message });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const { flexiTrackingId, accountId } = req.query;
    if (!flexiTrackingId || !accountId) {
      return res.status(400).send('Missing required callback parameters');
    }

    const paymentDetails = await hummService.getPaymentDetails(flexiTrackingId, accountId);
    const status = paymentDetails.status || paymentDetails.paymentStatus || paymentDetails.state;

    if (status === 'PAYMENT_DONE') {
      return res.redirect('/order-success');
    }

    if (status === 'PAYMENT_CANCELLED') {
      return res.redirect('/checkout?error=payment_cancelled');
    }

    return res.redirect('/checkout?error=payment_failed');
  } catch (error) {
    console.error('Error handling Humm callback:', error.message || error);
    return res.redirect('/checkout?error=payment_failed');
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { trackingId, accountId } = req.body;
    if (!trackingId || !accountId) {
      return res.status(400).json({ error: 'trackingId and accountId are required for refund' });
    }

    const result = await hummService.refundPayment(trackingId, accountId);
    return res.json({ result });
  } catch (error) {
    console.error('Error refunding Humm payment:', error.message || error);
    const hummError = mapHummError(error);
    const status = error.response ? error.response.status : 500;
    const message = hummError || error.response?.data?.message || 'Failed to refund payment';
    return res.status(status === 401 ? 401 : 500).json({ error: message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { trackingId, accountId } = req.body;
    if (!trackingId || !accountId) {
      return res.status(400).json({ error: 'trackingId and accountId are required for status' });
    }

    const paymentStatus = await hummService.getPaymentDetails(trackingId, accountId);
    return res.json(paymentStatus);
  } catch (error) {
    console.error('Error fetching Humm payment status:', error.message || error);
    const hummError = mapHummError(error);
    const status = error.response ? error.response.status : 500;
    const message = hummError || error.response?.data?.message || 'Failed to fetch payment status';
    return res.status(status === 401 ? 401 : 500).json({ error: message });
  }
};
