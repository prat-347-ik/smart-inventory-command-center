import httpClient from './httpClient';

export const analyticsApi = {
  /**
   * Fetches demand forecast for a specific SKU.
   * Calls Node.js (Proxy) -> Python (Analytics Engine)
   * @param {string} sku - Product SKU (e.g., "MON-001")
   * @param {number} days - Forecast horizon (default 7)
   */
  getForecast: async (sku, days = 7) => {
    // Matches prompt requirement: GET /analytics/forecast/:sku
    // We append the query param for days
    const response = await httpClient.get(`/api/analytics/forecast/${sku}?days=${days}`);
    return response.data;
  }
};