import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import assetImages from '../data/assetImages';
import { productsAPI, authAPI, adminAPI, ordersAPI, purchasesAPI } from '../services/api';

const resolveImageSrc = (img) => {
  if (!img) return 'https://via.placeholder.com/128x128?text=No+Image';
  const s = img.toString();
  if (s.startsWith('http') || s.startsWith('blob:') || s.startsWith('//')) return s;
  if (s.startsWith('/')) return `${process.env.PUBLIC_URL}${s}`;
  return `${process.env.PUBLIC_URL}/${s}`;
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('statistics');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab) setActiveTab(tab);
    } catch (e) {
      // ignore
    }
  }, [location.search]);
  const normalizeItems = (items) => {
    if (Array.isArray(items)) return items;
    if (!items) return [];
    if (typeof items === 'string') {
      const parts = items.split(',').map(s => s.trim()).filter(Boolean);
      return parts.map(p => {
        const m = p.match(/^(\d+)x\s*(.+)$/);
        if (m) return { id: null, name: m[2], quantity: Number(m[1]), price: null, image: null };
        return { id: null, name: p, quantity: 1, price: null, image: null };
      });
    }
    if (typeof items === 'object') {
      try {
        return Object.entries(items).map(([k, v]) => ({ id: k, name: k, quantity: v }));
      } catch (e) { return []; }
    }
    return [];
  };

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Medicines',
    price: '',
    description: '',
    stock: '',
    image: '/assets/default.jpg',
    imageFile: null
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [discountPercent, setDiscountPercent] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const fetchOrdersForStats = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      let ords = Array.isArray(data) ? data : [];

      // Also fetch purchase invoices and include them in the orders array
      try {
        const purchases = await purchasesAPI.getAll();
        if (Array.isArray(purchases) && purchases.length > 0) {
          const mapped = purchases.map(p => ({
            id: `purchase-${p.id}`,
            total: p.total_amount || p.total || p.amount || p.total_amount || 0,
            amount: p.total_amount || p.total || p.amount || 0,
            status: 'paid',
            created_at: p.created_at || p.createdAt || new Date().toISOString(),
            type: 'purchase',
            is_purchase: true
          }));
          ords = [...ords, ...mapped];
        }
      } catch (e) {
        console.warn('Failed to fetch purchases for stats', e && e.message);
      }

      setOrders(ords);
    } catch (err) {
      showMessage('error', 'Failed to load orders for statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
    if (activeTab === 'messages') {
      fetchMessages();
    }
    if (activeTab === 'recent-orders') {
      fetchOrdersForStats();
    }
    if (activeTab === 'discount') {
      fetchProducts();
    }
    if (activeTab === 'statistics') {
      fetchOrdersForStats();
    }
    if (activeTab === 'purchase') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getContactMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      const text = err?.message || 'Failed to load messages';
      if (text.includes('Admin') || text.includes('denied') || text.includes('Unauthorized') || text.includes('401') || text.includes('403')) {
        showMessage('error', 'Access denied. Please log in as an admin.');
      } else {
        showMessage('error', text);
      }
    } finally {
      setLoading(false);
    }
  };

  const openReply = (id) => {
    setReplyMessageId(id);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyMessageId(null);
    setReplyText('');
  };

  const sendReply = async (id) => {
    if (!replyText || replyText.trim().length === 0) {
      showMessage('error', 'Reply cannot be empty');
      return;
    }

    try {
      await adminAPI.replyToContactMessage(id, replyText);
      showMessage('success', 'Reply sent');
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'replied' } : m));
      cancelReply();
    } catch (err) {
      const text = err?.message || 'Failed to send reply';
      showMessage('error', text);
    }
  };

  const generateDemoOrders = (count = 10, purchaseCount = 0) => {
    const methods = ['card', 'paypal', 'cash', 'applepay'];
    const statuses = ['paid', 'pending', 'refunded'];
    const now = new Date();
    const demo = [];
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = (Math.random() * 120 + 5).toFixed(2);
      demo.push({
        id: `demo-sale-${i + 1}`,
        total: parseFloat(amount),
        amount: parseFloat(amount),
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        status: statuses[Math.random() > 0.9 ? 2 : (Math.random() > 0.1 ? 0 : 1)],
        created_at: date.toISOString(),
        type: 'sale',
      });
    }

    for (let j = 0; j < purchaseCount; j++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      demo.push({
        id: `demo-purchase-${j + 1}`,
        total: 0,
        amount: 0,
        paymentMethod: 'supplier',
        status: 'paid',
        created_at: date.toISOString(),
        type: 'purchase',
        is_purchase: true,
      });
    }

    setOrders(demo);
    setDemoMode(true);
    showMessage('success', `Generated ${count} demo sales and ${purchaseCount} purchase invoices`);
  };

  const generateDemoMonthlySales = (perMonth = 3) => {
    const now = new Date();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const targetNames = ['Dec','Jan','Feb','Mar'];
    const demo = [];
    for (const mName of targetNames) {
      const mIndex = monthNames.indexOf(mName);
      const year = (mIndex > now.getMonth()) ? (now.getFullYear() - 1) : now.getFullYear();
      for (let i = 0; i < perMonth; i++) {
        const day = Math.max(1, Math.floor(Math.random() * 25) + 1);
        const date = new Date(year, mIndex, day, Math.floor(Math.random()*12)+8);
        const amount = (Math.random() * 120 + 10).toFixed(2);
        demo.push({
          id: `demo-month-${mName.toLowerCase()}-${i+1}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          total: parseFloat(amount),
          amount: parseFloat(amount),
          paymentMethod: 'card',
          status: 'paid',
          created_at: date.toISOString(),
          type: 'sale'
        });
      }
    }

    setOrders(prev => [...(prev || []), ...demo]);
    setDemoMode(true);
    showMessage('success', `Generated demo sales for Dec/Jan/Feb/Mar (${perMonth} per month)`);
  };

  const clearDemoOrders = () => {
    setOrders([]);
    setDemoMode(false);
    showMessage('success', 'Demo data cleared');
  };

  const [purchaseForm, setPurchaseForm] = useState({
    invoice_no: '',
    supplier_name: '',
    currency: 'USD',
    items: [ { product_id: '', product_name: '', exp_date: '', quantity: 1, net_price: 0.00, public_price: 0.00 } ]
  });

  const [purchasesList, setPurchasesList] = useState([]);
  const [openPurchaseItems, setOpenPurchaseItems] = useState({}); // map purchaseId -> items array

  const currencies = [ 'USD', 'L.L', 'EUR', 'GBP', 'JPY', 'ILS' ];

  const addPurchaseItemRow = () => {
    setPurchaseForm(prev => ({ ...prev, items: [ ...prev.items, { product_id: '', product_name: '', exp_date: '', quantity: 1, net_price: 0.00, public_price: 0.00 } ] }));
  };

  const updatePurchaseItem = (index, field, value) => {
    setPurchaseForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      if (field === 'product_id') {
        const p = products.find(x => String(x.id) === String(value));
        if (p) items[index].product_name = p.name;
      }
      return { ...prev, items };
    });
  };

  const removePurchaseItem = (index) => {
    setPurchaseForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const submitPurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.invoice_no || !purchaseForm.supplier_name || !purchaseForm.currency) {
      showMessage('error', 'Please fill invoice number, supplier and currency');
      return;
    }
    if (!Array.isArray(purchaseForm.items) || purchaseForm.items.length === 0) {
      showMessage('error', 'Add at least one purchase item');
      return;
    }

    try {
      setLoading(true);
      const res = await purchasesAPI.create(purchaseForm);
      if (res && res.ok) {
        showMessage('success', (res.body && res.body.message) ? res.body.message : 'Purchase invoice saved');
        await fetchProducts();
        await fetchPurchases();
        setPurchaseForm({ invoice_no: '', supplier_name: '', currency: 'USD', items: [ { product_id: '', product_name: '', exp_date: '', quantity: 1, net_price: 0.00, public_price: 0.00 } ] });
      } else {
        // Surface detailed error info for easier debugging
        console.error('purchases.create response', res);
        let errMsg = 'Failed to save purchase';
        if (res && res.body) {
          if (typeof res.body === 'string') {
            const t = res.body.trim();
            if (t.startsWith('<')) {
              console.error('Server returned HTML response for /api/purchases:', t);
              errMsg = 'Server returned unexpected HTML response. Check backend logs.';
            } else {
              errMsg = t;
            }
          } else if (res.body.message) errMsg = res.body.message;
          else errMsg = JSON.stringify(res.body);
        } else if (res && res.status) {
          errMsg = `Request failed with status ${res.status}`;
        }
        showMessage('error', errMsg);
      }
    } catch (err) {
      console.error('submitPurchase error', err);
      showMessage('error', err?.message || 'Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchasesAPI.getAll();
      const list = Array.isArray(data) ? data : [];

      // preload items for each purchase so UI can show thumbnails/counts
      const enriched = await Promise.all(list.map(async (p) => {
        try {
          const items = await purchasesAPI.getItems(p.id);
          return { ...p, items: Array.isArray(items) ? items : [] };
        } catch (err) {
          return { ...p, items: [] };
        }
      }));

      setPurchasesList(enriched);
    } catch (e) {
      console.error('Failed to fetch purchases', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePurchaseItems = async (id) => {
    if (openPurchaseItems[id]) {
      setOpenPurchaseItems(prev => { const c = { ...prev }; delete c[id]; return c; });
      return;
    }

    // prefer preloaded items from purchasesList
    const p = purchasesList.find(x => String(x.id) === String(id));
    if (p && Array.isArray(p.items)) {
      setOpenPurchaseItems(prev => ({ ...prev, [id]: p.items }));
      return;
    }

    try {
      setLoading(true);
      const items = await purchasesAPI.getItems(id);
      setOpenPurchaseItems(prev => ({ ...prev, [id]: Array.isArray(items) ? items : [] }));
    } catch (e) {
      console.error('Failed to fetch purchase items', e);
      setOpenPurchaseItems(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showMessage('success', `Order ${id} marked ${status}`);
  };

  const confirmPayment = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, user_confirmed: true, status: 'paid' } : o));
    showMessage('success', `Payment for order ${id} confirmed — status set to paid`);
  };

  const computeDemoWallet = (ords) => {
    return (ords || []).reduce((s, o) => s + ((o.status && o.status.toString().toLowerCase().includes('paid')) ? (parseFloat(o.total || o.amount) || 0) : 0), 0);
  };

  const computeTotalRevenue = (ords) => {
    if (!ords || ords.length === 0) return 0;
    return ords.reduce((s, o) => s + (parseFloat(o.total || o.amount || 0) || 0), 0);
  };

  const computeAvgOrder = (ords) => {
    if (!ords || ords.length === 0) return 0;
    return computeTotalRevenue(ords) / ords.length;
  };

  const computeCountByStatus = (ords, status) => {
    if (!ords) return 0;
    const lower = (status || '').toLowerCase();
    return ords.filter(o => (o.status || '').toString().toLowerCase().includes(lower)).length;
  };

  const getMonthlyTotals = (ords, months = 6) => {
    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      result.push({ key, date: d, total: 0 });
    }

    ords.forEach(o => {
      const t = new Date(o.created_at || o.createdAt || o.date || Date.now());
      const k = `${t.getFullYear()}-${t.getMonth()+1}`;
      const item = result.find(r => r.key === k);
      if (item) item.total += (parseFloat(o.total || o.amount || 0) || 0);
    });

    return result;
  };

  const getMonthlyStats = (ords, months = 6) => {
    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      result.push({ key, date: d, total: 0, count: 0 });
    }

    ords.forEach(o => {
      const t = new Date(o.created_at || o.createdAt || o.date || Date.now());
      const k = `${t.getFullYear()}-${t.getMonth()+1}`;
      const item = result.find(r => r.key === k);
      if (item) {
        const amt = parseFloat(o.total || o.amount || 0) || 0;
        item.total += amt;
        item.count += 1;
      }
    });

    result.forEach(r => {
      r.avg = r.count > 0 ? (r.total / r.count) : 0;
    });

    return result;
  };

  const renderProfitComboChart = (ords) => {
    const months = 6;
    const data = getMonthlyTotals(ords, months);
    const values = data.map(d => d.total);
    const max = Math.max(...values, 1);

    const growth = values.map((v, i) => {
      if (i === 0) return 0;
      const prev = values[i - 1] || 1;
      return ((v - prev) / Math.max(prev, 1)) * 100;
    });
    const absMaxGrowth = Math.max(...growth.map(g => Math.abs(g)), 1);

    const w = 900, h = 360, pad = 36;
    const chartW = w - pad * 2;
    const barWidth = Math.max(12, chartW / Math.max(values.length, 1) - 6);

    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-96">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = pad + (1 - t) * (h - pad * 2);
          const val = Math.round(max * t).toLocaleString();
          return (
            <g key={i}>
              <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={pad - 6} y={y + 4} fontSize="11" textAnchor="end" fill="#374151">${val}</text>
            </g>
          );
        })}

        {values.map((v, i) => {
          const x = pad + i * (chartW / values.length) + 4;
          const hBar = (v / max) * (h - pad * 2);
          const y = h - pad - hBar;
          return (
            <rect key={i} x={x} y={y} width={barWidth} height={hBar} fill="#16a34a" rx={3} />
          );
        })}

        <polyline
          fill="none"
          stroke="#b91c1c"
          strokeWidth={2.5}
          points={growth.map((g, i) => {
            const x = pad + i * (chartW / values.length) + barWidth / 2 + 4;
            const y = h - pad - ((g + absMaxGrowth) / (absMaxGrowth * 2)) * (h - pad * 2);
            return `${x},${y}`;
          }).join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {growth.map((g, i) => {
          const x = pad + i * (chartW / values.length) + barWidth / 2 + 4;
          const y = h - pad - ((g + absMaxGrowth) / (absMaxGrowth * 2)) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#b91c1c" />;
        })}

        {data.map((d, i) => {
          const x = pad + i * (chartW / values.length) + barWidth / 2 + 4;
          return (
            <text key={i} x={x} y={h - 6} fontSize="11" textAnchor="middle" fill="#6b7280">{d.date.toLocaleString('default', { month: 'short' })}</text>
          );
        })}

        {[ -absMaxGrowth, 0, absMaxGrowth ].map((g, i) => {
          const t = (g + absMaxGrowth) / (absMaxGrowth * 2);
          const y = h - pad - t * (h - pad * 2);
          return (
            <text key={i} x={w - pad + 8} y={y + 4} fontSize="11" fill="#9ca3af">{Math.round(g)}%</text>
          );
        })}
      </svg>
    );
  };

  const renderPaymentBars = (ords) => {
    const counts = {};
    (ords || []).forEach(o => {
      const m = (o.paymentMethod || o.method || 'unknown').toString();
      counts[m] = (counts[m] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    const max = Math.max(...entries.map(e => e[1]), 1);

    return (
      <div className="space-y-2">
        {entries.length === 0 && <div className="text-gray-500">No payment data</div>}
        {entries.map(([m,c], idx) => (
          <div key={m} className="flex items-center space-x-3">
            <div className="text-sm w-28 text-gray-700">{m}</div>
            <div className="flex-1 bg-gray-100 h-4 rounded overflow-hidden">
              <div style={{ width: `${(c / max) * 100}%` }} className="h-4 bg-indigo-500"></div>
            </div>
            <div className="w-12 text-right text-sm">{c}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderCircularStats = (ords) => {
    const salesTotal = (ords || []).reduce((s, o) => s + ((o && !((o.type || '').toString().toLowerCase().includes('purchase') || o.is_purchase)) ? (parseFloat(o.total || o.amount || 0) || 0) : 0), 0);
    const purchaseTotal = (ords || []).reduce((s, o) => s + (((o && ((o.type || '').toString().toLowerCase().includes('purchase') || o.is_purchase))) ? (parseFloat(o.total || o.amount || 0) || 0) : 0), 0);
    const profit = salesTotal - purchaseTotal;
    const profitAbs = Math.abs(profit);

    const entries = [
      { key: 'Sales', value: Math.max(0, salesTotal), color: '#16a34a' },
      { key: 'Purchases', value: Math.max(0, purchaseTotal), color: '#06b6d4' },
      { key: profit >= 0 ? 'Profit' : 'Loss', value: profitAbs, color: profit >= 0 ? '#f59e0b' : '#ef4444' }
    ];

    const sum = entries.reduce((s, e) => s + (e.value || 0), 0) || 1;

    const r = 72;
    const stroke = 24;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return (
      <div className="mb-4">
        <div className="bg-white p-4 rounded shadow flex items-center space-x-6">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <g transform="translate(100,100)">
              {entries.map((e) => {
                const pct = (e.value || 0) / sum;
                const dash = Math.max(0.001, pct) * circumference;
                const dashArray = `${dash} ${circumference - dash}`;
                const dashOffset = -offset;
                offset += dash;
                return (
                  <circle key={e.key} r={r} fill="transparent" stroke={e.color} strokeWidth={stroke} strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="butt" transform="rotate(-90)" />
                );
              })}
              <circle r={r - stroke - 2} fill="#fff" />
            </g>
          </svg>

          <div>
            <div className="text-lg font-semibold">Invoices & Profit</div>
            <div className="text-sm text-gray-500 mb-2">Sales, Purchases and Profit</div>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.key} className="flex items-center space-x-3">
                  <span style={{ width: 12, height: 12, background: e.color, display: 'inline-block', borderRadius: 3 }}></span>
                  <div>
                    <div className="font-medium">{e.key}</div>
                    <div className="text-xs text-gray-500">{typeof e.value === 'number' ? `$${e.value.toFixed(2)}` : e.value} ({Math.round(((e.value||0)/sum)*100)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      // Normalize API response to an array to avoid runtime errors when mapping
      if (Array.isArray(data)) setProducts(data);
      else if (data && Array.isArray(data.value)) setProducts(data.value);
      else setProducts([]);
    } catch (error) {
      showMessage('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Helper: open printable window and trigger print (user can choose Save as PDF)
  const openPrintableWindow = (title, htmlContent) => {
    try {
      const newWin = window.open('', '_blank');
      if (!newWin) {
        showMessage('error', 'Popup blocked. Allow popups to export.');
        return;
      }
      const css = `<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style>`;
      newWin.document.write(`<html><head><title>${title}</title>${css}</head><body>${htmlContent}</body></html>`);
      newWin.document.close();
      // Give the new window a short moment to render then open print dialog
      newWin.onload = () => { setTimeout(() => { try { newWin.print(); } catch (e) { /* ignore */ } }, 250); };
    } catch (e) {
      showMessage('error', 'Failed to open export window');
    }
  };

  const exportPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchasesAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      const rows = list.map(p => `
        <tr>
          <td>${p.id || ''}</td>
          <td>${p.invoice_no || ''}</td>
          <td>${p.supplier_name || ''}</td>
          <td>${(p.total_amount || p.total || p.amount || 0)}</td>
          <td>${new Date(p.created_at || p.createdAt || Date.now()).toLocaleString()}</td>
        </tr>
      `).join('');
      const html = `<h1>Purchases</h1><table><thead><tr><th>ID</th><th>Invoice #</th><th>Supplier</th><th>Total</th><th>Created</th></tr></thead><tbody>${rows}</tbody></table>`;
      openPrintableWindow('Purchases Export', html);
      showMessage('success', 'Export window opened. Choose Save as PDF in print dialog.');
    } catch (e) {
      console.error('exportPurchases error', e);
      showMessage('error', 'Failed to export purchases');
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      const rows = list.map(o => `
        <tr>
          <td>${o.id || ''}</td>
          <td>${o.user_name || o.user_email || o.user || 'Guest'}</td>
          <td>${(o.total || o.amount || 0)}</td>
          <td>${(o.items && o.items.length) || 0}</td>
          <td>${o.status || ''}</td>
          <td>${new Date(o.created_at || o.createdAt || Date.now()).toLocaleString()}</td>
        </tr>
      `).join('');
      const html = `<h1>Orders</h1><table><thead><tr><th>ID</th><th>User</th><th>Total</th><th>Items</th><th>Status</th><th>Created</th></tr></thead><tbody>${rows}</tbody></table>`;
      openPrintableWindow('Orders Export', html);
      showMessage('success', 'Export window opened. Choose Save as PDF in print dialog.');
    } catch (e) {
      console.error('exportOrders error', e);
      showMessage('error', 'Failed to export orders');
    } finally {
      setLoading(false);
    }
  };

  const exportProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      const rows = list.map(p => `
        <tr>
          <td>${p.id || ''}</td>
          <td>${p.name || ''}</td>
          <td>${p.category || ''}</td>
          <td>${p.price || ''}</td>
          <td>${p.stock || ''}</td>
        </tr>
      `).join('');
      const html = `<h1>Products</h1><table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead><tbody>${rows}</tbody></table>`;
      openPrintableWindow('Products Export', html);
      showMessage('success', 'Export window opened. Choose Save as PDF in print dialog.');
    } catch (e) {
      console.error('exportProducts error', e);
      showMessage('error', 'Failed to export products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await productsAPI.create(productForm);
      if (res && res.product) {
        setProducts(prev => [res.product, ...prev]);
      } else {
        await fetchProducts();
      }
      showMessage('success', 'Product added successfully!');
      setProductForm({ name: '', category: 'Medicines', price: '', description: '', stock: '', image: '/assets/default.jpg', imageFile: null });
    } catch (error) {
      showMessage('error', 'Failed to add product');
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    try {
      console.log('AdminDashboard: updating product', id, 'updates:', updates);
      const res = await productsAPI.update(id, updates);
      if (res && res.product) {
        setProducts(prev => prev.map(p => p.id === id ? res.product : p));
      } else {
        await fetchProducts();
      }
      showMessage('success', 'Product updated successfully!');
      setEditingProduct(null);
    } catch (error) {
      showMessage('error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(id);
      showMessage('success', 'Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      showMessage('error', 'Failed to delete product');
    }
  };

  const handleApplyDiscount = () => {
    if (!discountPercent || discountPercent <= 0) {
      showMessage('error', 'Please enter a valid discount percentage');
      return;
    }

    const discount = parseFloat(discountPercent) / 100;

    const targets = (selectMode && selectedProductIds.length > 0)
      ? products.filter(p => selectedProductIds.includes(p.id))
      : products;

    if (targets.length === 0) {
      showMessage('error', 'No products selected for discount');
      return;
    }

    const updatedProducts = targets.map(product => ({
      ...product,
      price: (product.price * (1 - discount)).toFixed(2)
    }));

    updatedProducts.forEach(product => {
      handleUpdateProduct(product.id, { price: product.price });
    });

    setDiscountPercent('');
    setSelectedProductIds([]);
    setSelectMode(false);
    showMessage('success', `${discountPercent}% discount applied to ${targets.length} product(s)`);
  };

  const toggleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(x => x !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const selectAllVisible = (checked) => {
    if (checked) setSelectedProductIds(products.map(p => p.id));
    else setSelectedProductIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">👑 Admin Dashboard</h1>
          <p className="mt-2">Manage products, users, and inventory</p>
        </div>
      </div>

      {message.text && (
        <div className={`max-w-7xl mx-auto px-4 mt-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-4 py-3 rounded`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={exportProducts} className="px-3 py-2 text-white rounded transition" style={{background:'#06b6d4'}}>Export Products</button>
            </div>
            <h2 className="text-2xl font-bold mb-4">All Products</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-gray-600">No products yet.</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct?.id === product.id ? (
                            <div>
                              <select
                                value={editingProduct.image}
                                onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                                className="w-full border rounded px-2 py-1 mb-1"
                              >
                                {assetImages.map(p => <option key={p} value={p}>{p.replace(/^\//, '')}</option>)}
                              </select>
                              <img
                                src={resolveImageSrc(editingProduct.image)}
                                alt="preview"
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64x64?text=No+Image'; }}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-start">
                              <img
                                src={resolveImageSrc(product.image)}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded mb-1"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64x64?text=No+Image'; }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct?.id === product.id ? (
                            <input
                              type="text"
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingProduct?.id === product.id ? (
                            <select
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                              className="border rounded px-2 py-1"
                            >
                              <option>Medicines</option>
                              <option>Cosmetics</option>
                              <option>Vitamins</option>
                              <option>Personal Care</option>
                            </select>
                          ) : (
                            product.category
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct?.id === product.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                              className="border rounded px-2 py-1 w-20"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">${product.price}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct?.id === product.id ? (
                            <input
                              type="number"
                              value={editingProduct.stock}
                              onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                              className="border rounded px-2 py-1 w-20"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{product.stock}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {editingProduct?.id === product.id ? (
                            <>
                              <button
                              onClick={() => handleUpdateProduct(product.id, editingProduct)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option>Medicines</option>
                  <option>Cosmetics</option>
                  <option>Vitamins</option>
                  <option>Personal Care</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                    setProductForm(prev => ({ ...prev, imageFile: file, image: file ? URL.createObjectURL(file) : prev.image }));
                  }}
                  className="w-full"
                />

                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Image Preview:</p>
                  <img
                    src={(() => {
                      if (!productForm.image) return 'https://via.placeholder.com/128x128?text=No+Image';
                      const s = productForm.image.toString();
                      if (s.startsWith('http') || s.startsWith('blob:')) return s;
                      return `${process.env.PUBLIC_URL}${s}`;
                    })()}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/128x128?text=Image+Not+Found';
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition"
              >
                Add Product
              </button>
            </form>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">New Purchase Invoice</h2>
            <form onSubmit={submitPurchase} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice No *</label>
                  <input type="text" required value={purchaseForm.invoice_no} onChange={e => setPurchaseForm({...purchaseForm, invoice_no: e.target.value})} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Name *</label>
                  <input type="text" required value={purchaseForm.supplier_name} onChange={e => setPurchaseForm({...purchaseForm, supplier_name: e.target.value})} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency *</label>
                  <select required value={purchaseForm.currency} onChange={e => setPurchaseForm({...purchaseForm, currency: e.target.value})} className="w-full border rounded px-3 py-2">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Items</div>
                  <button type="button" onClick={addPurchaseItemRow} className="text-sm text-blue-600">+ Add item</button>
                </div>
                <div className="space-y-2">
                  {purchaseForm.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-2 items-end bg-gray-50 p-3 rounded">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600">Product</label>
                        <select value={it.product_id} onChange={e => updatePurchaseItem(idx, 'product_id', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="">-- select product --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Exp Date</label>
                        <input type="date" value={it.exp_date} onChange={e => updatePurchaseItem(idx, 'exp_date', e.target.value)} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Quantity</label>
                        <input type="number" min="1" value={it.quantity} onChange={e => updatePurchaseItem(idx, 'quantity', Number(e.target.value))} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Net Price</label>
                        <input type="number" step="0.01" value={it.net_price} onChange={e => updatePurchaseItem(idx, 'net_price', parseFloat(e.target.value) || 0)} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Public Price</label>
                        <input type="number" step="0.01" value={it.public_price} onChange={e => updatePurchaseItem(idx, 'public_price', parseFloat(e.target.value) || 0)} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <button type="button" onClick={() => removePurchaseItem(idx)} className="text-red-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end items-center space-x-3">
                <button type="button" onClick={exportPurchases} className="px-4 py-2 text-white rounded transition" style={{background:'#06b6d4'}}>Export Purchases</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded">Save Purchase</button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Recent Purchase Invoices</h3>
              <div className="bg-white border rounded shadow overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Invoice #</th>
                      <th className="px-4 py-2 text-left">Supplier</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-left">Items</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {purchasesList.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-4 text-gray-500">No purchase invoices yet.</td></tr>
                    )}
                    {purchasesList.map(p => (
                      <React.Fragment key={p.id}>
                        <tr>
                          <td className="px-4 py-3">{p.invoice_no || p.id}</td>
                          <td className="px-4 py-3">{p.supplier_name}</td>
                          <td className="px-4 py-3 text-right">${((parseFloat(p.total_amount) || 0).toFixed(2))}</td>
                          <td className="px-4 py-3">
                            {Array.isArray(p.items) && p.items.length > 0 ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                  {p.items.slice(0,3).map((it, i) => (
                                    <img key={i} src={resolveImageSrc(it.product_image || it.image)} alt={it.product_name || it.product_name} className="w-8 h-8 object-cover rounded border" onError={(e)=>{e.target.onerror=null;e.target.src='https://via.placeholder.com/32'}} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">{p.items.length}</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">{new Date(p.created_at || p.createdAt || Date.now()).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => togglePurchaseItems(p.id)} className="text-blue-600 hover:text-blue-900">
                              {openPurchaseItems[p.id] ? 'Hide Items' : 'View Items'}
                            </button>
                          </td>
                        </tr>

                        {openPurchaseItems[p.id] && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {openPurchaseItems[p.id].length === 0 && <div className="text-gray-500">No items found for this invoice.</div>}
                                {openPurchaseItems[p.id].map(it => (
                                  <div key={it.id || it.product_name} className="flex items-center space-x-3 bg-white border rounded p-2">
                                    <img src={resolveImageSrc(it.product_image || it.image)} alt={it.product_name} className="w-16 h-16 object-cover rounded" onError={(e)=>{e.target.onerror=null;e.target.src='https://via.placeholder.com/64'}} />
                                    <div className="flex-1">
                                      <div className="font-medium">{it.product_name || it.product_name}</div>
                                      <div className="text-sm text-gray-500">Qty: {it.quantity || 0} • Exp: {it.exp_date || '—'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discount' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Apply Bulk Discount</h2>
            <p className="text-gray-600 mb-4">Apply a discount percentage to all products at once</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., 10 for 10% off"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input id="select-mode" type="checkbox" checked={selectMode} onChange={(e) => setSelectMode(e.target.checked)} />
                <label htmlFor="select-mode" className="text-sm">Select specific products</label>
              </div>

              {selectMode && (
                <div className="border rounded p-3 max-h-60 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Choose products</div>
                    <div>
                      <button onClick={() => selectAllVisible(true)} className="text-sm text-blue-600 mr-2">Select all</button>
                      <button onClick={() => selectAllVisible(false)} className="text-sm text-gray-600">Clear</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center space-x-2 text-sm border-b pb-2">
                        <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleSelectProduct(p.id)} />
                        <span className="truncate">{p.name} — ${p.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleApplyDiscount}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Apply {discountPercent}% Discount to All Products
              </button>
              <p className="text-sm text-gray-500">⚠️ This will permanently update product prices</p>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
            <div className="mb-4">
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Refresh</button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map(m => (
                      <React.Fragment key={m.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{m.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{m.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {m.user_id ? (
                            <span className="text-sm text-primary">{m.user_name} (ID {m.user_id})</span>
                          ) : (
                            <span className="text-sm text-gray-500">Guest</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{m.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{m.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(m.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {m.status === 'replied' ? (
                            <span className="text-sm text-green-600">Replied</span>
                          ) : (
                            <button onClick={() => openReply(m.id)} className="text-blue-600 hover:text-blue-900">Reply</button>
                          )}
                        </td>
                      </tr>
                          {replyMessageId === m.id && (
                        <tr key={`reply-${m.id}`} className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Write your reply here"
                              />
                              <div className="flex space-x-2 relative z-20">
                                <button type="button" onClick={() => sendReply(m.id)} className="px-4 py-2 bg-primary text-white rounded">Send Reply</button>
                                <button type="button" onClick={cancelReply} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {m.reply && !replyMessageId && (
                        <tr key={`stored-reply-${m.id}`} className="bg-green-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="p-3 rounded">
                              <div className="text-sm font-medium text-green-700">Reply{m.replied_by_name ? ` by ${m.replied_by_name}` : ''}{m.replied_at ? ` on ${new Date(m.replied_at).toLocaleString()}` : ''}</div>
                              <div className="text-sm text-gray-800 mt-1 whitespace-pre-line">{m.reply}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent-orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <div>
                <button onClick={exportOrders} className="px-4 py-2 text-white rounded transition" style={{background:'#06b6d4'}}>Export Orders</button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow h-full overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-left">Items</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orders.slice(0, 50).map(o => (
                      <React.Fragment key={o.id}>
                        <tr>
                          <td className="px-4 py-3">{o.id}</td>
                          <td className="px-4 py-3">{o.user_name || o.user_email || 'Guest'}</td>
                          <td className="px-4 py-3 text-right">${((parseFloat(o.total) || 0).toFixed(2))}</td>
                          <td className="px-4 py-3">{(o.items && o.items.length) || 0}</td>
                          <td className="px-4 py-3">{o.status}</td>
                          <td className="px-4 py-3">{new Date(o.created_at || Date.now()).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => {
                              if (expandedOrders.includes(o.id)) setExpandedOrders(expandedOrders.filter(id => id !== o.id));
                              else setExpandedOrders([...expandedOrders, o.id]);
                            }} className="text-blue-600 hover:text-blue-900 mr-3">{expandedOrders.includes(o.id) ? 'Hide Items' : 'View Items'}</button>
                          </td>
                        </tr>

                        {expandedOrders.includes(o.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {(() => {
                                  const itemsArray = normalizeItems(o.items);
                                  return itemsArray.map(item => (
                                    <div key={item.id || item.name} className="flex items-center space-x-3 bg-white border rounded p-2">
                                      <img
                                        src={(item.image && item.image.toString().startsWith('http')) ? item.image : (item.image ? `${process.env.PUBLIC_URL}${item.image}` : 'https://via.placeholder.com/64')}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64'; }}
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">Qty: {item.quantity || 1} {item.price ? `• $${((parseFloat(item.price) || 0).toFixed(2))}` : ''}</div>
                                      </div>
                                    </div>
                                  ));
                                })()}
                                {normalizeItems(o.items).length === 0 && <div className="text-gray-500">No items found for this order.</div>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-gray-500">No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Statistics & Reports</h2>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-4 rounded shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">Profits (last 6 months)</div>
                      <div className="text-xs text-gray-400">Detailed monthly breakdown</div>
                    </div>
                    <div style={{ height: '640px' }} className="w-full">
                      {renderProfitComboChart(orders)}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                  <div className="bg-white p-4 rounded shadow">
                    {renderCircularStats(orders)}
                  </div>
                  <div className="bg-white p-4 rounded shadow overflow-auto" style={{ maxHeight: '420px' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="pb-2">Month</th>
                          <th className="pb-2 text-right">Total</th>
                          <th className="pb-2 text-right">Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getMonthlyStats(orders, 6).map(ms => (
                          <tr key={ms.key} className="border-t">
                            <td className="py-2 text-sm text-gray-700">{ms.date.toLocaleString('default', { month: 'short' })} {ms.date.getFullYear()}</td>
                            <td className="py-2 text-sm text-right font-medium">${ms.total.toFixed(2)}</td>
                            <td className="py-2 text-sm text-right text-gray-600">{ms.count}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t mt-2">
                        <tr>
                          <td className="pt-2 text-sm font-semibold">Total</td>
                          <td className="pt-2 text-sm font-semibold text-right">${getMonthlyStats(orders, 6).reduce((s,r)=>s+r.total,0).toFixed(2)}</td>
                          <td className="pt-2 text-sm font-semibold text-right">{getMonthlyStats(orders, 6).reduce((s,r)=>s+r.count,0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
