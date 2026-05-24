(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@pharmacare.com', password: 'admin123' })
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN_STATUS', loginRes.status);
    if (!loginJson.token) { console.error('No token in login response:', loginJson); process.exit(2); }
    const token = loginJson.token;

    const postBody = {
      invoice_no: 'NODE-TEST-POST-001',
      supplier_name: 'test supplier',
      currency: 'USD',
      items: [
        { product_id: 19, product_name: 'whey protein', exp_date: '2028-12-12', quantity: 3, net_price: 85, public_price: 100 }
      ]
    };

    const res = await fetch('http://localhost:5000/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(postBody)
    });

    console.log('PURCHASE_STATUS', res.status);
    const text = await res.text();
    try { console.log('PURCHASE_BODY', JSON.parse(text)); } catch (e) { console.log('PURCHASE_BODY_RAW', text); }
  } catch (e) {
    console.error('ERR', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
