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

  // [ADD THIS]
  login: async (email, password) => {
    const response = await httpClient.post('/api/auth/login', { 
      email, password 
    });
    return response.data;
  },
  

  // Products (Inventory)
  getProducts: async () => {
    const response = await httpClient.get('/api/products');
    return response.data;
  },

  // [NEW] Bulk Upload CSV
  uploadProductsCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // axios handles multipart/form-data automatically if we pass FormData,
    // but explicit headers ensure the backend treats it correctly.
    const response = await httpClient.post('/api/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  },

  // [NEW] Update Product
  updateProduct: async (sku, data) => {
    const response = await httpClient.put(`/api/products/${sku}`, data);
    return response.data;
  },

  // [NEW] Delete Product
  deleteProduct: async (sku) => {
    const response = await httpClient.delete(`/api/products/${sku}`);
    return response.data;
  }
};

