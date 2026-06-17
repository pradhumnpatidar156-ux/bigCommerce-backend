const axios = require('axios');

class TokenManager {
  constructor() {
    if (TokenManager._instance) {
      return TokenManager._instance;
    }

    this.accessToken = null;
    this.instanceUrl = null;
    this.tokenExpiresAt = null;
    TokenManager._instance = this;
  }

  static getInstance() {
    if (!TokenManager._instance) {
      TokenManager._instance = new TokenManager();
    }

    return TokenManager._instance;
  }

  isTokenExpired() {
    return !this.accessToken || !this.tokenExpiresAt || Date.now() >= this.tokenExpiresAt;
  }

  async fetchToken() {
    const baseUrl = process.env.SF_BASE_URL;
    const clientId = process.env.SF_CLIENT_ID;
    const clientSecret = process.env.SF_CLIENT_SECRET;
    const refreshToken = process.env.SF_REFRESH_TOKEN;

    if (!baseUrl || !clientId || !clientSecret || !refreshToken) {
      throw new Error('Salesforce credentials are not configured in environment variables');
    }

    const tokenUrl = `${baseUrl}/services/oauth2/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    if (!data.access_token) {
      throw new Error('Unable to fetch access token from Salesforce');
    }

    this.accessToken = data.access_token;
    this.instanceUrl = data.instance_url || null;
    this.tokenExpiresAt = Date.now() + 105 * 60 * 1000; // 105 minutes
    return this.accessToken;
  }

  async getAccessToken(forceRefresh = false) {
    if (forceRefresh || this.isTokenExpired()) {
      await this.fetchToken();
    }

    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
    this.instanceUrl = null;
    this.tokenExpiresAt = null;
  }
}

module.exports = TokenManager.getInstance();
