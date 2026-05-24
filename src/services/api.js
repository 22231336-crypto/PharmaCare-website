// API Service for PharmaCare Backend
const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Products APIs
export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`);
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
  },

  create: async (productData) => {
    // If a File is provided, send as multipart/form-data so backend can store upload
    if (productData?.image instanceof File || productData?.imageFile instanceof File) {
      const form = new FormData();
      const file = productData.image instanceof File ? productData.image : productData.imageFile;
      form.append('image', file);
      if (typeof productData.name !== 'undefined') form.append('name', productData.name);
      if (typeof productData.category !== 'undefined') form.append('category', productData.category);
      if (typeof productData.price !== 'undefined') form.append('price', productData.price);
      if (typeof productData.description !== 'undefined') form.append('description', productData.description);
      if (typeof productData.stock !== 'undefined') form.append('stock', productData.stock);

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: form,
      });

      // Try to parse JSON; fallback to text
      try { return await response.json(); } catch (e) { try { return await response.text(); } catch (e2) { return null; } }
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  update: async (id, productData) => {
    // Support file uploads via multipart/form-data when image file provided
    if (productData?.image instanceof File || productData?.imageFile instanceof File) {
      const form = new FormData();
      const file = productData.image instanceof File ? productData.image : productData.imageFile;
      form.append('image', file);
      if (typeof productData.name !== 'undefined') form.append('name', productData.name);
      if (typeof productData.category !== 'undefined') form.append('category', productData.category);
      if (typeof productData.price !== 'undefined') form.append('price', productData.price);
      if (typeof productData.description !== 'undefined') form.append('description', productData.description);
      if (typeof productData.stock !== 'undefined') form.append('stock', productData.stock);

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: form,
      });
      try { return await response.json(); } catch (e) { try { return await response.text(); } catch (e2) { return null; } }
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },
};

// Orders APIs
export const ordersAPI = {
  create: async (orderData) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      body = null;
    }

    return { ok: response.ok, status: response.status, body };
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },
};

// Purchases API
export const purchasesAPI = {
  create: async (purchaseData) => {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(purchaseData),
    });

    // Try to parse JSON; if server returns HTML or non-JSON, fall back to text
    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      try { body = await response.text(); } catch (e2) { body = null; }
    }

    return { ok: response.ok, status: response.status, body };
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/purchases`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  }
  ,
  getItems: async (purchaseId) => {
    const response = await fetch(`${API_URL}/purchases/${purchaseId}/items`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  }
};

// Contact API
export const contactAPI = {
  submit: async (contactData) => {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    return response.json();
  },
};

// Admin APIs
export const adminAPI = {
  getContactMessages: async () => {
    // Try primary endpoint first; fall back to alternate admin path if server uses a different route.
    const endpoints = [`${API_URL}/contact-messages`, `${API_URL}/admin/contact-messages`];
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        // Try parse JSON, but gracefully handle non-JSON responses
        let body = null;
        try { body = await response.json(); } catch (e) { try { body = await response.text(); } catch (e2) { body = null; } }

        if (response.ok) {
          // Normalize response to always return an array of messages
          if (Array.isArray(body)) return body;
          if (body && Array.isArray(body.value)) return body.value;
          // fallback: if server returned an object with Count and value-like shape
          return body ? (body.value || body.result || [body]) : [];
        }
        const msg = body && body.message ? body.message : `Request failed with status ${response.status}`;
        // If server error, try next endpoint; otherwise raise
        if (response.status >= 500) {
          lastErr = new Error(msg);
          continue;
        }
        throw new Error(msg);
      } catch (err) {
        lastErr = err;
        // try next endpoint
      }
    }
    throw lastErr || new Error('Failed to fetch contact messages');
  }
  ,
  replyToContactMessage: async (id, replyText) => {
    // Try primary route then alternate admin route
    const urls = [`${API_URL}/contact-messages/${id}/reply`, `${API_URL}/admin/contact-messages/${id}/reply`];
    let lastErr = null;
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ reply: replyText }),
        });
        let body = null;
        try { body = await response.json(); } catch (e) { try { body = await response.text(); } catch (e2) { body = null; } }
        if (response.ok) return body;
        const msg = body && body.message ? body.message : `Request failed with status ${response.status}`;
        lastErr = new Error(msg);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Failed to send reply');
  }
};

// Chatbot API
export const chatbotAPI = {
  send: async (payload) => {
    // If payload contains a File (image), send as FormData
    if (payload?.image instanceof File || payload?.imageFile instanceof File) {
      const form = new FormData();
      if (payload.message) form.append('message', payload.message);
      if (payload.prescriptionText) form.append('prescriptionText', payload.prescriptionText);
      const file = payload.image || payload.imageFile;
      form.append('image', file);

      const response = await fetch(`${API_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: form,
      });
      return response.json();
    }

    const response = await fetch(`${API_URL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
};

// Chatbot Gemini proxy (frontend helper)
export const chatbotGemini = {
  send: async (payload) => {
    // If payload contains a File (image), send as FormData
    if (payload?.image instanceof File || payload?.imageFile instanceof File) {
      const form = new FormData();
      if (payload.message) form.append('message', payload.message);
      if (payload.prescriptionText) form.append('prescriptionText', payload.prescriptionText);
      const file = payload.image || payload.imageFile;
      form.append('image', file);

      const response = await fetch(`${API_URL}/chatbot-gemini`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: form,
      });
      return response.json();
    }

    const response = await fetch(`${API_URL}/chatbot-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return response.json();
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(profileData),
    });

    let body = null;
    try { body = await response.json(); } catch (e) { body = null; }
    return { ok: response.ok, status: response.status, body };
  }
};
