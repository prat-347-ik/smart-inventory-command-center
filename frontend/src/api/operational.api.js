import httpClient from './httpClient';

export const operationalApi = {
  // Auth: Registration Only (MVP)
  // Backend returns: { token: "...", user: { ... } }
  register: async (username, email, password, role) => {
    const response = await httpClient.post('/api/auth/register', { 
      username, email, password, role 
    });
    return response.data;
  },

  // Products (Inventory)
  getProducts: async () => {
    const response = await httpClient.get('/api/products');
    return response.data;
  },

  // [NEW] Get Single Product (for Stock Level)
  getProduct: async (sku) => {
    const response = await httpClient.get(`/api/products/${sku}`);
    return response.data;
  },

  // Orders
  createOrder: async (items, userId) => {
    const response = await httpClient.post('/api/orders', { items, userId });
    return response.data;
  }
};

